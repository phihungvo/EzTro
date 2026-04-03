package carevn.luv2code.ez_tro.service.admin.impl;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.Gson;

import carevn.luv2code.ez_tro.dto.response.NotificationDeliveryLogResponse;
import carevn.luv2code.ez_tro.entity.NotificationDeliveryLog;
import carevn.luv2code.ez_tro.entity.NotificationEvent;
import carevn.luv2code.ez_tro.entity.NotificationPreference;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.NotificationCategory;
import carevn.luv2code.ez_tro.enums.NotificationChannel;
import carevn.luv2code.ez_tro.enums.NotificationDeliveryStatus;
import carevn.luv2code.ez_tro.enums.NotificationPriority;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.repository.NotificationDeliveryLogRepository;
import carevn.luv2code.ez_tro.repository.NotificationPreferenceRepository;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.NotificationDeliveryService;
import carevn.luv2code.ez_tro.specification.NotificationDeliveryLogSpecs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class NotificationDeliveryServiceImpl implements NotificationDeliveryService {

    private static final String PREF_BILLING_ISSUE = "BILLING_ISSUE";
    private static final String PREF_CONTRACT_EXPIRING = "CONTRACT_EXPIRING";
    private static final String PREF_INCIDENT_UPDATES = "INCIDENT_UPDATES";
    private static final String PREF_ANNOUNCEMENTS = "ANNOUNCEMENTS";
    private static final String PREF_PAYMENT_UPDATES = "PAYMENT_UPDATES";
    private static final String PREF_SECURITY_ALERTS = "SECURITY_ALERTS";
    private static final String PREF_SUBSCRIPTION_ALERTS = "SUBSCRIPTION_ALERTS";

    private final NotificationDeliveryLogRepository notificationDeliveryLogRepository;
    private final NotificationPreferenceRepository notificationPreferenceRepository;
    private final List<NotificationChannelSender> channelSenders;
    private final Gson gson = new Gson();

    @Value("${app.notifications.delivery.max-attempts:3}")
    private int defaultMaxAttempts;

    @Value("${app.notifications.delivery.retry-backoff-minutes:15}")
    private long retryBackoffMinutes;

    @Override
    public void queueExternalDeliveries(
            NotificationEvent event,
            String eventKey,
            String title,
            String message,
            String payloadJson,
            NotificationCategory category,
            NotificationPriority priority,
            List<User> recipients) {
        if (event == null || recipients == null || recipients.isEmpty()) {
            return;
        }

        List<NotificationDeliveryLog> existingLogs = notificationDeliveryLogRepository.findByEvent(event);
        Set<String> existingKeys = existingLogs.stream()
                .map(log -> buildUniqueKey(log.getRecipient().getId(), log.getChannel()))
                .collect(Collectors.toSet());

        LocalDateTime now = LocalDateTime.now();
        List<NotificationDeliveryLog> logsToCreate = new ArrayList<>();
        List<User> uniqueRecipients = recipients.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(User::getId, user -> user, (first, ignored) -> first, LinkedHashMap::new))
                .values()
                .stream()
                .toList();

        for (User recipient : uniqueRecipients) {
            for (NotificationChannel channel : resolveChannelsForEvent(eventKey, category, priority)) {
                String dedupeKey = buildUniqueKey(recipient.getId(), channel);
                if (existingKeys.contains(dedupeKey)) {
                    continue;
                }

                boolean enabled = isChannelEnabled(recipient, eventKey, channel);
                String destination = resolveDestination(recipient, channel);
                NotificationDeliveryStatus status = enabled && destination != null
                        ? NotificationDeliveryStatus.QUEUED
                        : NotificationDeliveryStatus.SKIPPED;

                logsToCreate.add(NotificationDeliveryLog.builder()
                        .event(event)
                        .recipient(recipient)
                        .channel(channel)
                        .status(status)
                        .provider(resolveProviderName(channel))
                        .destination(destination)
                        .title(title)
                        .message(message)
                        .payloadJson(payloadJson)
                        .attemptCount(0)
                        .maxAttempts(defaultMaxAttempts)
                        .nextRetryAt(status == NotificationDeliveryStatus.QUEUED ? now : null)
                        .lastError(resolveInitialSkipReason(enabled, destination))
                        .build());
            }
        }

        if (!logsToCreate.isEmpty()) {
            notificationDeliveryLogRepository.saveAll(logsToCreate);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationDeliveryLogResponse> getDeliveryLogs(
            Pageable pageable, String channel, String status, Integer eventId, String keyword) {
        User currentUser = SecurityUtils.getCurrentUserOrThrow();
        boolean admin = SecurityUtils.isAdmin();
        boolean owner = SecurityUtils.isOwner();
        if (!admin && !owner) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        Pageable sorted = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by("createdAt").descending().and(Sort.by("id").descending()));

        return notificationDeliveryLogRepository
                .findAll(
                        NotificationDeliveryLogSpecs.actorScope(currentUser, admin)
                                .and(NotificationDeliveryLogSpecs.channel(channel))
                                .and(NotificationDeliveryLogSpecs.status(status))
                                .and(NotificationDeliveryLogSpecs.eventId(eventId))
                                .and(NotificationDeliveryLogSpecs.keyword(keyword)),
                        sorted)
                .map(this::toResponse);
    }

    @Override
    public int processPendingDeliveries(int limit) {
        int effectiveLimit = limit > 0 ? limit : 50;
        LocalDateTime now = LocalDateTime.now();
        Page<NotificationDeliveryLog> page = notificationDeliveryLogRepository.findAll(
                NotificationDeliveryLogSpecs.pendingForProcessing(
                                List.of(NotificationDeliveryStatus.QUEUED, NotificationDeliveryStatus.FAILED), now)
                        .and((root, query, cb) -> cb.lessThan(root.get("attemptCount"), root.get("maxAttempts"))),
                PageRequest.of(
                        0,
                        effectiveLimit,
                        Sort.by("nextRetryAt").ascending().and(Sort.by("id").ascending())));

        int processed = 0;
        for (NotificationDeliveryLog logEntry : page.getContent()) {
            processSingleLog(logEntry);
            processed++;
        }
        return processed;
    }

    private void processSingleLog(NotificationDeliveryLog logEntry) {
        LocalDateTime now = LocalDateTime.now();
        logEntry.setAttemptCount((logEntry.getAttemptCount() != null ? logEntry.getAttemptCount() : 0) + 1);
        logEntry.setLastAttemptAt(now);

        NotificationChannelSender sender = channelSenders.stream()
                .filter(candidate -> candidate.getChannel() == logEntry.getChannel())
                .findFirst()
                .orElse(null);

        if (sender == null) {
            logEntry.setStatus(NotificationDeliveryStatus.SKIPPED);
            logEntry.setNextRetryAt(null);
            logEntry.setLastError("Không có adapter cho channel " + logEntry.getChannel());
            notificationDeliveryLogRepository.save(logEntry);
            return;
        }

        try {
            NotificationChannelSender.DeliveryAttemptResult result = sender.send(logEntry);
            logEntry.setStatus(result.status());
            logEntry.setProviderMessageId(result.providerMessageId());
            logEntry.setLastResponseJson(result.responseJson());
            logEntry.setLastError(result.errorMessage());
            logEntry.setNextRetryAt(
                    result.status() == NotificationDeliveryStatus.FAILED
                                    && logEntry.getAttemptCount() < logEntry.getMaxAttempts()
                            ? now.plusMinutes(retryBackoffMinutes * logEntry.getAttemptCount())
                            : null);
        } catch (Exception ex) {
            log.warn("Notification delivery failed for log {}: {}", logEntry.getId(), ex.getMessage(), ex);
            logEntry.setStatus(NotificationDeliveryStatus.FAILED);
            logEntry.setLastError(ex.getMessage());
            logEntry.setLastResponseJson(gson.toJson(Map.of(
                    "exception", ex.getClass().getSimpleName(),
                    "message", ex.getMessage(),
                    "at", now.toString())));
            logEntry.setNextRetryAt(
                    logEntry.getAttemptCount() < logEntry.getMaxAttempts()
                            ? now.plusMinutes(retryBackoffMinutes * logEntry.getAttemptCount())
                            : null);
        }

        notificationDeliveryLogRepository.save(logEntry);
    }

    private NotificationDeliveryLogResponse toResponse(NotificationDeliveryLog entity) {
        return NotificationDeliveryLogResponse.builder()
                .id(entity.getId())
                .eventId(entity.getEvent() != null ? entity.getEvent().getId() : null)
                .eventKey(entity.getEvent() != null ? entity.getEvent().getEventKey() : null)
                .title(entity.getTitle())
                .message(entity.getMessage())
                .recipientId(
                        entity.getRecipient() != null ? entity.getRecipient().getId() : null)
                .recipientName(
                        entity.getRecipient() != null ? entity.getRecipient().getFullName() : null)
                .recipientEmail(
                        entity.getRecipient() != null ? entity.getRecipient().getEmail() : null)
                .recipientPhoneNumber(
                        entity.getRecipient() != null ? entity.getRecipient().getPhoneNumber() : null)
                .channel(entity.getChannel() != null ? entity.getChannel().name() : null)
                .status(entity.getStatus() != null ? entity.getStatus().name() : null)
                .provider(entity.getProvider())
                .destination(entity.getDestination())
                .attemptCount(entity.getAttemptCount())
                .maxAttempts(entity.getMaxAttempts())
                .lastAttemptAt(entity.getLastAttemptAt())
                .nextRetryAt(entity.getNextRetryAt())
                .providerMessageId(entity.getProviderMessageId())
                .lastError(entity.getLastError())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private Set<NotificationChannel> resolveChannelsForEvent(
            String eventKey, NotificationCategory category, NotificationPriority priority) {
        Set<NotificationChannel> channels = EnumSet.noneOf(NotificationChannel.class);
        String normalizedKey = eventKey == null ? "" : eventKey.toUpperCase(Locale.ROOT);

        if (category == NotificationCategory.BILLING
                || category == NotificationCategory.CONTRACT
                || category == NotificationCategory.SUBSCRIPTION
                || category == NotificationCategory.PAYMENT
                || category == NotificationCategory.SECURITY
                || normalizedKey.contains("ANNOUNCEMENT")) {
            channels.add(NotificationChannel.EMAIL);
        }

        if (category == NotificationCategory.SECURITY
                || category == NotificationCategory.PAYMENT
                || priority == NotificationPriority.CRITICAL) {
            channels.add(NotificationChannel.SMS);
        }

        if (normalizedKey.contains("ANNOUNCEMENT")
                || category == NotificationCategory.MARKETING
                || category == NotificationCategory.OPERATIONS) {
            channels.add(NotificationChannel.ZALO);
        }

        return channels;
    }

    private boolean isChannelEnabled(User recipient, String eventKey, NotificationChannel channel) {
        String preferenceKey = resolvePreferenceKey(eventKey);
        if (preferenceKey == null) {
            return channel == NotificationChannel.EMAIL;
        }

        Optional<NotificationPreference> preference =
                notificationPreferenceRepository.findByUserAndEventKeyAndChannel(recipient, preferenceKey, channel);
        if (preference.isPresent()) {
            NotificationPreference stored = preference.get();
            if (Boolean.TRUE.equals(stored.getMandatory())) {
                return true;
            }
            return Boolean.TRUE.equals(stored.getEnabled());
        }

        return defaultChannelEnabled(preferenceKey, channel);
    }

    private boolean defaultChannelEnabled(String preferenceKey, NotificationChannel channel) {
        return switch (preferenceKey) {
            case PREF_BILLING_ISSUE, PREF_CONTRACT_EXPIRING -> switch (channel) {
                case IN_APP, EMAIL -> true;
                case SMS, ZALO -> false;
            };
            case PREF_INCIDENT_UPDATES -> switch (channel) {
                case IN_APP, ZALO -> true;
                case EMAIL, SMS -> false;
            };
            case PREF_ANNOUNCEMENTS -> false;
            case PREF_PAYMENT_UPDATES -> switch (channel) {
                case IN_APP, EMAIL, SMS -> true;
                case ZALO -> false;
            };
            case PREF_SECURITY_ALERTS -> switch (channel) {
                case IN_APP, EMAIL, SMS -> true;
                case ZALO -> false;
            };
            case PREF_SUBSCRIPTION_ALERTS -> switch (channel) {
                case IN_APP, EMAIL -> true;
                case SMS, ZALO -> false;
            };
            default -> channel == NotificationChannel.IN_APP;
        };
    }

    private String resolvePreferenceKey(String eventKey) {
        if (eventKey == null || eventKey.isBlank()) {
            return null;
        }

        String normalized = eventKey.toUpperCase(Locale.ROOT);
        if (normalized.contains("SECURITY")) {
            return PREF_SECURITY_ALERTS;
        }
        if (normalized.contains("PAYMENT")) {
            return PREF_PAYMENT_UPDATES;
        }
        if (normalized.contains("SUBSCRIPTION") || normalized.contains("QUOTA")) {
            return PREF_SUBSCRIPTION_ALERTS;
        }
        if (normalized.contains("INCIDENT") || normalized.contains("MAINTENANCE")) {
            return PREF_INCIDENT_UPDATES;
        }
        if (normalized.contains("CONTRACT")) {
            return PREF_CONTRACT_EXPIRING;
        }
        if (normalized.contains("ANNOUNCEMENT")
                || normalized.contains("PROMOTION")
                || normalized.contains("MARKETING")) {
            return PREF_ANNOUNCEMENTS;
        }
        if (normalized.contains("BILL")) {
            return PREF_BILLING_ISSUE;
        }
        return null;
    }

    private String resolveDestination(User recipient, NotificationChannel channel) {
        if (recipient == null) {
            return null;
        }
        return switch (channel) {
            case EMAIL -> isBlank(recipient.getEmail())
                    ? null
                    : recipient.getEmail().trim();
            case SMS, ZALO -> isBlank(recipient.getPhoneNumber())
                    ? null
                    : recipient.getPhoneNumber().trim();
            default -> null;
        };
    }

    private String resolveProviderName(NotificationChannel channel) {
        return switch (channel) {
            case EMAIL -> "SMTP";
            case SMS -> "SMS_STUB";
            case ZALO -> "ZALO_STUB";
            default -> channel.name();
        };
    }

    private String resolveInitialSkipReason(boolean enabled, String destination) {
        if (!enabled) {
            return "Channel bị tắt bởi preference";
        }
        if (destination == null) {
            return "Thiếu thông tin đích nhận";
        }
        return null;
    }

    private String buildUniqueKey(Integer recipientId, NotificationChannel channel) {
        return recipientId + ":" + channel.name();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
