package carevn.luv2code.ez_tro.service.admin.impl;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;

import carevn.luv2code.ez_tro.dto.requests.NotificationAnnouncementRequest;
import carevn.luv2code.ez_tro.dto.requests.NotificationPreferenceChannelUpdateRequest;
import carevn.luv2code.ez_tro.dto.requests.NotificationPreferencesUpdateRequest;
import carevn.luv2code.ez_tro.dto.response.AnnouncementRecipientResponse;
import carevn.luv2code.ez_tro.dto.response.NotificationAnnouncementPreviewResponse;
import carevn.luv2code.ez_tro.dto.response.NotificationPreferenceChannelResponse;
import carevn.luv2code.ez_tro.dto.response.NotificationPreferencesResponse;
import carevn.luv2code.ez_tro.dto.response.NotificationResponse;
import carevn.luv2code.ez_tro.entity.Bill;
import carevn.luv2code.ez_tro.entity.Notification;
import carevn.luv2code.ez_tro.entity.NotificationEvent;
import carevn.luv2code.ez_tro.entity.NotificationPreference;
import carevn.luv2code.ez_tro.entity.Role;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.NotificationAnnouncementTargetType;
import carevn.luv2code.ez_tro.enums.NotificationCategory;
import carevn.luv2code.ez_tro.enums.NotificationChannel;
import carevn.luv2code.ez_tro.enums.NotificationDeliveryStatus;
import carevn.luv2code.ez_tro.enums.NotificationInboxStatus;
import carevn.luv2code.ez_tro.enums.NotificationPriority;
import carevn.luv2code.ez_tro.enums.NotificationReadStatus;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.repository.BillRepository;
import carevn.luv2code.ez_tro.repository.NotificationEventRepository;
import carevn.luv2code.ez_tro.repository.NotificationPreferenceRepository;
import carevn.luv2code.ez_tro.repository.NotificationRepository;
import carevn.luv2code.ez_tro.repository.UserRepository;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.NotificationDeliveryService;
import carevn.luv2code.ez_tro.service.admin.NotificationService;
import carevn.luv2code.ez_tro.specification.NotificationInboxSpecs;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private static final String PREF_BILLING_ISSUE = "BILLING_ISSUE";
    private static final String PREF_CONTRACT_EXPIRING = "CONTRACT_EXPIRING";
    private static final String PREF_INCIDENT_UPDATES = "INCIDENT_UPDATES";
    private static final String PREF_ANNOUNCEMENTS = "ANNOUNCEMENTS";
    private static final String PREF_PAYMENT_UPDATES = "PAYMENT_UPDATES";
    private static final String PREF_SECURITY_ALERTS = "SECURITY_ALERTS";
    private static final String PREF_SUBSCRIPTION_ALERTS = "SUBSCRIPTION_ALERTS";
    private static final String DEFAULT_ACTION_LABEL = "Xem chi tiết";

    private final NotificationRepository notificationRepo;
    private final NotificationEventRepository notificationEventRepository;
    private final NotificationPreferenceRepository notificationPreferenceRepository;
    private final NotificationDeliveryService notificationDeliveryService;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;
    private final BillRepository billRepository;
    private final Gson gson = new Gson();

    @Override
    public void sendToUser(Integer userId, String title, String message, String type, Object data) {
        User recipient = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        publish(type, title, message, data, List.of(recipient));
    }

    @Override
    public void sendToUsers(List<Integer> userIds, String title, String message, String type, Object data) {
        if (userIds == null || userIds.isEmpty()) {
            return;
        }
        List<User> recipients = userRepository.findAllById(userIds).stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(User::getId, user -> user, (first, ignored) -> first, LinkedHashMap::new))
                .values()
                .stream()
                .toList();
        publish(type, title, message, data, recipients);
    }

    @Override
    public void sendToAll(String title, String message, String type, Object data) {
        List<User> recipients = userRepository.findAll();
        publish(type, title, message, data, recipients);
    }

    @Override
    public void sendToAllTenantsOfOwner(Integer ownerId, String title, String message, String type, Object data) {
        List<User> recipients = userRepository.findActiveTenantsByOwnerId(ownerId);
        publish(type, title, message, data, recipients);
    }

    @Override
    public void sendBillReminder(Integer billId) {
        Bill bill = billRepository.findById(billId).orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("billId", bill.getId());
        data.put("amount", bill.getAmount());
        data.put("dueDate", bill.getDueDate() != null ? bill.getDueDate().toString() : null);
        data.put("roomNumber", bill.getRoom() != null ? bill.getRoom().getRoomNumber() : null);

        sendToUser(
                bill.getContract().getTenant().getUser().getId(),
                "Nhắc thanh toán hóa đơn",
                "Hóa đơn phòng " + bill.getRoom().getRoomNumber() + " sắp đến hạn: " + bill.getAmount() + "đ",
                "BILL_REMINDER",
                data);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getMyNotifications(
            Pageable pageable, String status, String category, String keyword) {
        User currentUser = SecurityUtils.getCurrentUserOrThrow();
        NotificationInboxStatus inboxStatus = parseInboxStatus(status);
        NotificationCategory notificationCategory = parseCategory(category);

        Pageable sorted = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by("createdAt").descending().and(Sort.by("id").descending()));

        return notificationRepo
                .findAll(
                        NotificationInboxSpecs.recipient(currentUser)
                                .and(NotificationInboxSpecs.inboxStatus(inboxStatus))
                                .and(NotificationInboxSpecs.category(notificationCategory))
                                .and(NotificationInboxSpecs.keyword(keyword)),
                        sorted)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnread() {
        User currentUser = SecurityUtils.getCurrentUserOrThrow();
        return notificationRepo.countByRecipientAndReadStatusAndArchivedAtIsNull(
                currentUser, NotificationReadStatus.UNREAD);
    }

    @Override
    public void markAsRead(Integer notificationId) {
        Notification notification = notificationRepo
                .findById(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        validateRecipient(notification);
        if (notification.getReadStatus() == NotificationReadStatus.READ) {
            return;
        }

        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        notification.setReadStatus(NotificationReadStatus.READ);
        notificationRepo.save(notification);
    }

    @Override
    public void markAllAsRead() {
        User currentUser = SecurityUtils.getCurrentUserOrThrow();
        List<Notification> unreadNotifications = notificationRepo.findByRecipientAndReadStatusAndArchivedAtIsNull(
                currentUser, NotificationReadStatus.UNREAD);

        if (unreadNotifications.isEmpty()) {
            return;
        }

        LocalDateTime readAt = LocalDateTime.now();
        unreadNotifications.forEach(notification -> {
            notification.setIsRead(true);
            notification.setReadAt(readAt);
            notification.setReadStatus(NotificationReadStatus.READ);
        });
        notificationRepo.saveAll(unreadNotifications);
    }

    @Override
    public void archive(Integer notificationId) {
        Notification notification = notificationRepo
                .findById(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        validateRecipient(notification);
        LocalDateTime now = LocalDateTime.now();
        notification.setArchivedAt(now);
        notification.setReadAt(notification.getReadAt() != null ? notification.getReadAt() : now);
        notification.setReadStatus(NotificationReadStatus.ARCHIVED);
        notification.setIsRead(true);
        notificationRepo.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationAnnouncementPreviewResponse previewAnnouncement(NotificationAnnouncementRequest request) {
        AnnouncementResolution resolution = resolveAnnouncementRecipients(request);
        return buildAnnouncementPreview(request, resolution.recipients());
    }

    @Override
    public NotificationAnnouncementPreviewResponse sendAnnouncement(NotificationAnnouncementRequest request) {
        AnnouncementResolution resolution = resolveAnnouncementRecipients(request);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put(
                "targetType",
                request.getTargetType() != null ? request.getTargetType().name() : null);
        payload.put("targetIds", request.getTargetIds());
        payload.put("announcement", true);
        payload.put("recipientCount", resolution.recipients().size());
        payload.put("scopeOwnerId", resolution.ownerId());

        publish(
                resolution.eventKey(),
                request.getTitle(),
                request.getMessage(),
                payload,
                resolution.recipients(),
                resolveAnnouncementMetadata(request));

        return buildAnnouncementPreview(request, resolution.recipients());
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationPreferencesResponse getMyPreferences() {
        User currentUser = SecurityUtils.getCurrentUserOrThrow();
        Map<String, Map<NotificationChannel, NotificationPreference>> preferenceMap =
                notificationPreferenceRepository.findByUser(currentUser).stream()
                        .collect(Collectors.groupingBy(
                                NotificationPreference::getEventKey,
                                Collectors.toMap(
                                        NotificationPreference::getChannel,
                                        preference -> preference,
                                        (existing, ignored) -> existing,
                                        () -> new EnumMap<>(NotificationChannel.class))));

        return NotificationPreferencesResponse.builder()
                .billingIssue(buildPreferenceResponse(preferenceMap, PREF_BILLING_ISSUE))
                .contractExpiring(buildPreferenceResponse(preferenceMap, PREF_CONTRACT_EXPIRING))
                .incidentUpdates(buildPreferenceResponse(preferenceMap, PREF_INCIDENT_UPDATES))
                .announcements(buildPreferenceResponse(preferenceMap, PREF_ANNOUNCEMENTS))
                .paymentUpdates(buildPreferenceResponse(preferenceMap, PREF_PAYMENT_UPDATES))
                .securityAlerts(buildPreferenceResponse(preferenceMap, PREF_SECURITY_ALERTS))
                .subscriptionAlerts(buildPreferenceResponse(preferenceMap, PREF_SUBSCRIPTION_ALERTS))
                .build();
    }

    @Override
    public NotificationPreferencesResponse updateMyPreferences(NotificationPreferencesUpdateRequest request) {
        User currentUser = SecurityUtils.getCurrentUserOrThrow();

        upsertPreferenceSet(currentUser, PREF_BILLING_ISSUE, request.getBillingIssue());
        upsertPreferenceSet(currentUser, PREF_CONTRACT_EXPIRING, request.getContractExpiring());
        upsertPreferenceSet(currentUser, PREF_INCIDENT_UPDATES, request.getIncidentUpdates());
        upsertPreferenceSet(currentUser, PREF_ANNOUNCEMENTS, request.getAnnouncements());
        upsertPreferenceSet(currentUser, PREF_PAYMENT_UPDATES, request.getPaymentUpdates());
        upsertPreferenceSet(currentUser, PREF_SECURITY_ALERTS, request.getSecurityAlerts());
        upsertPreferenceSet(currentUser, PREF_SUBSCRIPTION_ALERTS, request.getSubscriptionAlerts());

        return getMyPreferences();
    }

    private void publish(String eventKey, String title, String message, Object data, List<User> recipients) {
        publish(eventKey, title, message, data, recipients, null);
    }

    private void publish(
            String eventKey,
            String title,
            String message,
            Object data,
            List<User> recipients,
            NotificationTypeMetadata metadataOverride) {
        if (recipients == null || recipients.isEmpty()) {
            return;
        }

        User actor = SecurityUtils.getCurrentUser();
        String payloadJson = toJson(data);
        Map<String, Object> payload = toMap(payloadJson);
        NotificationTypeMetadata metadata = metadataOverride != null ? metadataOverride : resolveMetadata(eventKey);
        NotificationEvent event = createOrReuseEvent(eventKey, title, message, payloadJson, metadata, actor, payload);
        List<User> uniqueRecipients = recipients.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(User::getId, user -> user, (first, ignored) -> first, LinkedHashMap::new))
                .values()
                .stream()
                .toList();
        List<User> recipientsToDeliver = uniqueRecipients.stream()
                .filter(recipient -> !notificationRepo.existsByEventAndRecipient(event, recipient))
                .toList();

        if (recipientsToDeliver.isEmpty()) {
            return;
        }

        List<Notification> deliveries = recipientsToDeliver.stream()
                .filter(recipient -> isInAppEnabled(recipient, eventKey))
                .map(recipient -> buildDelivery(
                        recipient, actor, event, eventKey, title, message, payloadJson, payload, metadata))
                .toList();

        if (!deliveries.isEmpty()) {
            List<Notification> saved = notificationRepo.saveAll(deliveries);
            saved.forEach(notification -> messagingTemplate.convertAndSendToUser(
                    notification.getRecipient().getUsername(), "/queue/notifications", toResponse(notification)));
        }

        notificationDeliveryService.queueExternalDeliveries(
                event,
                eventKey,
                title,
                message,
                payloadJson,
                metadata.category(),
                metadata.priority(),
                recipientsToDeliver);
    }

    private Notification buildDelivery(
            User recipient,
            User actor,
            NotificationEvent event,
            String eventKey,
            String title,
            String message,
            String payloadJson,
            Map<String, Object> payload,
            NotificationTypeMetadata metadata) {
        return Notification.builder()
                .event(event)
                .recipient(recipient)
                .senderId(actor != null ? actor.getId() : null)
                .title(title)
                .message(message)
                .type(eventKey)
                .eventKey(eventKey)
                .category(metadata.category())
                .priority(metadata.priority())
                .channel(NotificationChannel.IN_APP)
                .deliveryStatus(NotificationDeliveryStatus.DELIVERED)
                .readStatus(NotificationReadStatus.UNREAD)
                .data(payloadJson)
                .metadataJson(payloadJson)
                .actionUrl(resolveActionUrl(recipient, payload, eventKey))
                .actionLabel(metadata.actionLabel())
                .recipientRole(resolvePrimaryRole(recipient))
                .isBroadcast(false)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    private NotificationEvent createOrReuseEvent(
            String eventKey,
            String title,
            String message,
            String payloadJson,
            NotificationTypeMetadata metadata,
            User actor,
            Map<String, Object> payload) {
        String dedupeKey =
                payload != null && payload.get("dedupeKey") != null ? String.valueOf(payload.get("dedupeKey")) : null;

        if (dedupeKey != null && !dedupeKey.isBlank()) {
            Optional<NotificationEvent> existing =
                    notificationEventRepository.findTopByDedupeKeyOrderByCreatedAtDesc(dedupeKey);
            if (existing.isPresent()) {
                return existing.get();
            }
        }

        return notificationEventRepository.save(NotificationEvent.builder()
                .eventKey(eventKey)
                .category(metadata.category())
                .priority(metadata.priority())
                .sourceModule(metadata.category().name())
                .entityType(resolveEntityType(payload))
                .entityId(resolveEntityId(payload))
                .actorUser(actor)
                .payloadJson(payloadJson)
                .dedupeKey(dedupeKey)
                .title(title)
                .message(message)
                .occurredAt(LocalDateTime.now())
                .build());
    }

    private NotificationResponse toResponse(Notification notification) {
        NotificationReadStatus readStatus = normalizeReadStatus(notification);
        NotificationCategory category = notification.getCategory() != null
                ? notification.getCategory()
                : resolveMetadata(
                                notification.getEventKey() != null
                                        ? notification.getEventKey()
                                        : notification.getType())
                        .category();
        NotificationPriority priority = notification.getPriority() != null
                ? notification.getPriority()
                : resolveMetadata(
                                notification.getEventKey() != null
                                        ? notification.getEventKey()
                                        : notification.getType())
                        .priority();

        return NotificationResponse.builder()
                .id(notification.getId())
                .eventId(
                        notification.getEvent() != null
                                ? notification.getEvent().getId()
                                : null)
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .eventKey(notification.getEventKey() != null ? notification.getEventKey() : notification.getType())
                .category(category.name())
                .priority(priority.name())
                .channel(
                        notification.getChannel() != null
                                ? notification.getChannel().name()
                                : NotificationChannel.IN_APP.name())
                .actionUrl(notification.getActionUrl())
                .actionLabel(notification.getActionLabel())
                .recipientRole(notification.getRecipientRole())
                .data(deserializeJson(notification.getData()))
                .read(readStatus == NotificationReadStatus.READ)
                .createdAt(notification.getCreatedAt())
                .build();
    }

    private NotificationReadStatus normalizeReadStatus(Notification notification) {
        if (notification.getReadStatus() != null) {
            return notification.getReadStatus();
        }
        if (Boolean.TRUE.equals(notification.getIsRead())) {
            return NotificationReadStatus.READ;
        }
        return NotificationReadStatus.UNREAD;
    }

    private void validateRecipient(Notification notification) {
        User currentUser = SecurityUtils.getCurrentUserOrThrow();
        if (notification.getRecipient() == null
                || !notification.getRecipient().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
    }

    private boolean isInAppEnabled(User recipient, String eventKey) {
        String preferenceKey = resolvePreferenceKey(eventKey);
        if (preferenceKey == null) {
            return true;
        }

        ChannelPreferencePolicy policy = channelPreferencePolicy(preferenceKey, NotificationChannel.IN_APP);
        if (policy.mandatory()) {
            return true;
        }

        return notificationPreferenceRepository
                .findByUserAndEventKeyAndChannel(recipient, preferenceKey, NotificationChannel.IN_APP)
                .map(NotificationPreference::getEnabled)
                .orElse(policy.defaultEnabled());
    }

    private void upsertPreferenceSet(
            User user, String preferenceKey, NotificationPreferenceChannelUpdateRequest request) {
        upsertPreference(user, preferenceKey, NotificationChannel.IN_APP, request != null ? request.getInApp() : null);
        upsertPreference(user, preferenceKey, NotificationChannel.EMAIL, request != null ? request.getEmail() : null);
        upsertPreference(user, preferenceKey, NotificationChannel.SMS, request != null ? request.getSms() : null);
        upsertPreference(user, preferenceKey, NotificationChannel.ZALO, request != null ? request.getZalo() : null);
    }

    private void upsertPreference(User user, String preferenceKey, NotificationChannel channel, Boolean enabled) {
        ChannelPreferencePolicy policy = channelPreferencePolicy(preferenceKey, channel);
        boolean effectiveEnabled = policy.mandatory() ? true : enabled != null ? enabled : policy.defaultEnabled();

        NotificationPreference preference = notificationPreferenceRepository
                .findByUserAndEventKeyAndChannel(user, preferenceKey, channel)
                .orElse(NotificationPreference.builder()
                        .user(user)
                        .eventKey(preferenceKey)
                        .channel(channel)
                        .build());

        preference.setMandatory(policy.mandatory());
        preference.setEnabled(effectiveEnabled);
        notificationPreferenceRepository.save(preference);
    }

    private NotificationPreferenceChannelResponse buildPreferenceResponse(
            Map<String, Map<NotificationChannel, NotificationPreference>> preferenceMap, String key) {
        List<String> mandatoryChannels = Arrays.stream(NotificationChannel.values())
                .filter(channel -> channelPreferencePolicy(key, channel).mandatory())
                .map(Enum::name)
                .toList();

        return NotificationPreferenceChannelResponse.builder()
                .inApp(resolvePreferenceValue(preferenceMap, key, NotificationChannel.IN_APP))
                .email(resolvePreferenceValue(preferenceMap, key, NotificationChannel.EMAIL))
                .sms(resolvePreferenceValue(preferenceMap, key, NotificationChannel.SMS))
                .zalo(resolvePreferenceValue(preferenceMap, key, NotificationChannel.ZALO))
                .mandatoryChannels(mandatoryChannels)
                .build();
    }

    private boolean resolvePreferenceValue(
            Map<String, Map<NotificationChannel, NotificationPreference>> preferenceMap,
            String key,
            NotificationChannel channel) {
        NotificationPreference preference = Optional.ofNullable(preferenceMap.get(key))
                .map(item -> item.get(channel))
                .orElse(null);
        if (preference != null) {
            return Boolean.TRUE.equals(preference.getEnabled());
        }
        return channelPreferencePolicy(key, channel).defaultEnabled();
    }

    private ChannelPreferencePolicy channelPreferencePolicy(String key, NotificationChannel channel) {
        return switch (key) {
            case PREF_BILLING_ISSUE -> switch (channel) {
                case IN_APP -> new ChannelPreferencePolicy(false, true);
                case EMAIL -> new ChannelPreferencePolicy(false, true);
                case SMS, ZALO -> new ChannelPreferencePolicy(false, false);
            };
            case PREF_CONTRACT_EXPIRING -> switch (channel) {
                case IN_APP -> new ChannelPreferencePolicy(false, true);
                case EMAIL -> new ChannelPreferencePolicy(false, true);
                case SMS, ZALO -> new ChannelPreferencePolicy(false, false);
            };
            case PREF_INCIDENT_UPDATES -> switch (channel) {
                case IN_APP -> new ChannelPreferencePolicy(false, true);
                case EMAIL, SMS -> new ChannelPreferencePolicy(false, false);
                case ZALO -> new ChannelPreferencePolicy(false, true);
            };
            case PREF_ANNOUNCEMENTS -> switch (channel) {
                case IN_APP, EMAIL, SMS, ZALO -> new ChannelPreferencePolicy(false, false);
            };
            case PREF_PAYMENT_UPDATES -> switch (channel) {
                case IN_APP, EMAIL -> new ChannelPreferencePolicy(true, true);
                case SMS -> new ChannelPreferencePolicy(false, true);
                case ZALO -> new ChannelPreferencePolicy(false, false);
            };
            case PREF_SECURITY_ALERTS -> switch (channel) {
                case IN_APP, EMAIL, SMS -> new ChannelPreferencePolicy(true, true);
                case ZALO -> new ChannelPreferencePolicy(false, false);
            };
            case PREF_SUBSCRIPTION_ALERTS -> switch (channel) {
                case IN_APP, EMAIL -> new ChannelPreferencePolicy(false, true);
                case SMS, ZALO -> new ChannelPreferencePolicy(false, false);
            };
            default -> new ChannelPreferencePolicy(false, channel == NotificationChannel.IN_APP);
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

    private NotificationTypeMetadata resolveMetadata(String eventKey) {
        String normalized = eventKey == null ? "SYSTEM" : eventKey.toUpperCase(Locale.ROOT);

        if (normalized.contains("SECURITY")) {
            return new NotificationTypeMetadata(
                    NotificationCategory.SECURITY, NotificationPriority.CRITICAL, DEFAULT_ACTION_LABEL);
        }
        if (normalized.contains("PAYMENT")) {
            return new NotificationTypeMetadata(
                    NotificationCategory.PAYMENT, NotificationPriority.HIGH, DEFAULT_ACTION_LABEL);
        }
        if (normalized.contains("BILL")) {
            NotificationPriority priority = normalized.contains("OVERDUE") || normalized.contains("DISCREPANCY")
                    ? NotificationPriority.HIGH
                    : NotificationPriority.MEDIUM;
            return new NotificationTypeMetadata(NotificationCategory.BILLING, priority, DEFAULT_ACTION_LABEL);
        }
        if (normalized.contains("CONTRACT")) {
            NotificationPriority priority = normalized.contains("TERMINATED") || normalized.contains("TRANSFERRED")
                    ? NotificationPriority.HIGH
                    : NotificationPriority.MEDIUM;
            return new NotificationTypeMetadata(NotificationCategory.CONTRACT, priority, DEFAULT_ACTION_LABEL);
        }
        if (normalized.contains("INCIDENT") || normalized.contains("MAINTENANCE")) {
            return new NotificationTypeMetadata(
                    NotificationCategory.INCIDENT, NotificationPriority.HIGH, DEFAULT_ACTION_LABEL);
        }
        if (normalized.contains("SUBSCRIPTION") || normalized.contains("QUOTA")) {
            return new NotificationTypeMetadata(
                    NotificationCategory.SUBSCRIPTION, NotificationPriority.HIGH, DEFAULT_ACTION_LABEL);
        }
        if (normalized.contains("ASSET") || normalized.contains("UTILITY")) {
            return new NotificationTypeMetadata(
                    NotificationCategory.OPERATIONS, NotificationPriority.MEDIUM, DEFAULT_ACTION_LABEL);
        }
        if (normalized.contains("ANNOUNCEMENT")
                || normalized.contains("PROMOTION")
                || normalized.contains("MARKETING")) {
            return new NotificationTypeMetadata(
                    NotificationCategory.MARKETING, NotificationPriority.LOW, "Xem thông báo");
        }
        return new NotificationTypeMetadata(NotificationCategory.SYSTEM, NotificationPriority.MEDIUM, "Mở thông báo");
    }

    private String resolvePrimaryRole(User user) {
        if (user == null || user.getRoles() == null || user.getRoles().isEmpty()) {
            return "USER";
        }
        Set<String> roles = user.getRoles().stream().map(Role::getName).collect(Collectors.toSet());
        if (roles.contains("ADMIN")) {
            return "ADMIN";
        }
        if (roles.contains("OWNER")) {
            return "OWNER";
        }
        return "USER";
    }

    private String resolveActionUrl(User recipient, Map<String, Object> payload, String eventKey) {
        String role = resolvePrimaryRole(recipient);
        if ("USER".equals(role)) {
            return resolveUserActionUrl(payload, eventKey);
        }
        return resolveBackofficeActionUrl(role, payload, eventKey);
    }

    private String resolveUserActionUrl(Map<String, Object> payload, String eventKey) {
        if (payload != null) {
            if (payload.containsKey("incidentId")) {
                return "/user/dashboard?tab=my-room";
            }
            if (payload.containsKey("paymentId")) {
                return "/user/dashboard?tab=bills";
            }
            if (payload.containsKey("billId")) {
                return "/user/dashboard?tab=bills";
            }
            if (payload.containsKey("contractId")) {
                return "/user/dashboard?tab=contract";
            }
            if (payload.containsKey("utilityId") || payload.containsKey("roomNumber")) {
                return "/user/dashboard?tab=utilities";
            }
            if (payload.containsKey("profileAction")) {
                return "/user/dashboard?tab=profile";
            }
        }
        if (eventKey != null && eventKey.toUpperCase(Locale.ROOT).contains("CONTRACT")) {
            return "/user/dashboard?tab=contract";
        }
        return "/user/dashboard";
    }

    private String resolveBackofficeActionUrl(String role, Map<String, Object> payload, String eventKey) {
        String prefix = "/" + role.toLowerCase(Locale.ROOT);
        if (payload != null) {
            if (payload.containsKey("paymentId")) {
                return prefix + "/admin-payment-management";
            }
            if (payload.containsKey("billId")) {
                return prefix + "/bills";
            }
            if (payload.containsKey("contractId")) {
                return prefix + "/contracts";
            }
            if (payload.containsKey("tenantId")) {
                return prefix + "/tenants";
            }
            if (payload.containsKey("incidentId")) {
                return prefix + "/incidents";
            }
            if (payload.containsKey("subscriptionId") || payload.containsKey("quota")) {
                return "ADMIN".equals(role) ? "/admin/owner-subscription" : prefix + "/owner-subscription";
            }
            if (payload.containsKey("buildingId")) {
                return prefix + "/buildings";
            }
            if (payload.containsKey("roomId")) {
                return prefix + "/rooms";
            }
        }
        if (eventKey != null && eventKey.toUpperCase(Locale.ROOT).contains("SUBSCRIPTION")) {
            return "ADMIN".equals(role) ? "/admin/owner-subscription" : prefix + "/owner-subscription";
        }
        return prefix + "/dashboard";
    }

    private String resolveEntityType(Map<String, Object> payload) {
        if (payload == null) {
            return null;
        }
        if (payload.containsKey("paymentId")) {
            return "PAYMENT";
        }
        if (payload.containsKey("billId")) {
            return "BILL";
        }
        if (payload.containsKey("contractId")) {
            return "CONTRACT";
        }
        if (payload.containsKey("incidentId")) {
            return "INCIDENT";
        }
        if (payload.containsKey("tenantId")) {
            return "TENANT";
        }
        if (payload.containsKey("buildingId")) {
            return "BUILDING";
        }
        if (payload.containsKey("roomId")) {
            return "ROOM";
        }
        if (payload.containsKey("subscriptionId")) {
            return "SUBSCRIPTION";
        }
        return null;
    }

    private String resolveEntityId(Map<String, Object> payload) {
        if (payload == null) {
            return null;
        }
        for (String key : List.of(
                "paymentId",
                "billId",
                "contractId",
                "incidentId",
                "tenantId",
                "buildingId",
                "roomId",
                "subscriptionId")) {
            Object value = payload.get(key);
            if (value != null) {
                return String.valueOf(value);
            }
        }
        return null;
    }

    private AnnouncementResolution resolveAnnouncementRecipients(NotificationAnnouncementRequest request) {
        if (request == null || request.getTargetType() == null) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        User currentUser = SecurityUtils.getCurrentUserOrThrow();
        boolean admin = SecurityUtils.isAdmin();
        boolean owner = SecurityUtils.isOwner();
        if (!admin && !owner) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        List<Integer> targetIds = request.getTargetIds() != null ? request.getTargetIds() : List.of();
        NotificationAnnouncementTargetType targetType = request.getTargetType();

        List<User> recipients =
                switch (targetType) {
                    case ALL_SYSTEM -> {
                        if (!admin) {
                            throw new AppException(ErrorCode.FORBIDDEN);
                        }
                        yield userRepository.findAll();
                    }
                    case ALL_TENANTS_OF_OWNER -> {
                        Integer ownerId = owner ? currentUser.getId() : firstTargetId(targetIds);
                        yield userRepository.findActiveTenantsByOwnerId(ownerId);
                    }
                    case BOARDING_HOUSE -> {
                        requireTargetIds(targetIds);
                        yield owner
                                ? userRepository.findActiveTenantsByBoardingHouseIdsAndOwnerId(
                                        targetIds, currentUser.getId())
                                : userRepository.findActiveTenantsByBoardingHouseIds(targetIds);
                    }
                    case BUILDING -> {
                        requireTargetIds(targetIds);
                        yield owner
                                ? userRepository.findActiveTenantsByBuildingIdsAndOwnerId(
                                        targetIds, currentUser.getId())
                                : userRepository.findActiveTenantsByBuildingIds(targetIds);
                    }
                    case ROOM -> {
                        requireTargetIds(targetIds);
                        yield owner
                                ? userRepository.findActiveTenantsByRoomIdsAndOwnerId(targetIds, currentUser.getId())
                                : userRepository.findActiveTenantsByRoomIds(targetIds);
                    }
                    case TENANT_LIST -> {
                        requireTargetIds(targetIds);
                        yield owner
                                ? userRepository.findActiveTenantsByTenantIdsAndOwnerId(targetIds, currentUser.getId())
                                : userRepository.findActiveTenantsByTenantIds(targetIds);
                    }
                };

        List<User> deduped = recipients.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(User::getId, user -> user, (first, ignored) -> first, LinkedHashMap::new))
                .values()
                .stream()
                .toList();

        if (deduped.isEmpty()) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        String eventKey = admin ? "SYSTEM_ANNOUNCEMENT" : "TENANT_ANNOUNCEMENT";
        Integer ownerId = targetType == NotificationAnnouncementTargetType.ALL_TENANTS_OF_OWNER
                ? (owner ? currentUser.getId() : firstTargetId(targetIds))
                : null;
        return new AnnouncementResolution(eventKey, ownerId, deduped);
    }

    private NotificationAnnouncementPreviewResponse buildAnnouncementPreview(
            NotificationAnnouncementRequest request, List<User> recipients) {
        return NotificationAnnouncementPreviewResponse.builder()
                .targetType(
                        request.getTargetType() != null
                                ? request.getTargetType().name()
                                : null)
                .recipientCount(recipients.size())
                .recipients(recipients.stream()
                        .map(recipient -> AnnouncementRecipientResponse.builder()
                                .userId(recipient.getId())
                                .fullName(recipient.getFullName())
                                .email(recipient.getEmail())
                                .role(resolvePrimaryRole(recipient))
                                .build())
                        .toList())
                .build();
    }

    private NotificationTypeMetadata resolveAnnouncementMetadata(NotificationAnnouncementRequest request) {
        NotificationCategory category = parseCategory(request.getCategory());
        NotificationPriority priority = parsePriority(request.getPriority());
        return new NotificationTypeMetadata(
                category != null ? category : NotificationCategory.SYSTEM,
                priority != null ? priority : NotificationPriority.MEDIUM,
                "Mở thông báo");
    }

    private Integer firstTargetId(List<Integer> targetIds) {
        requireTargetIds(targetIds);
        return targetIds.get(0);
    }

    private void requireTargetIds(List<Integer> targetIds) {
        if (targetIds == null || targetIds.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
    }

    private String toJson(Object value) {
        if (value == null) {
            return null;
        }
        return gson.toJson(value);
    }

    private Object deserializeJson(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            return gson.fromJson(json, Object.class);
        } catch (JsonSyntaxException ex) {
            return json;
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> toMap(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyMap();
        }
        try {
            Object parsed = gson.fromJson(json, Object.class);
            if (parsed instanceof Map<?, ?> map) {
                return (Map<String, Object>) map;
            }
            return Collections.emptyMap();
        } catch (JsonSyntaxException ex) {
            return Collections.emptyMap();
        }
    }

    private NotificationInboxStatus parseInboxStatus(String raw) {
        if (raw == null || raw.isBlank()) {
            return NotificationInboxStatus.ALL;
        }
        try {
            return NotificationInboxStatus.valueOf(raw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return NotificationInboxStatus.ALL;
        }
    }

    private NotificationCategory parseCategory(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return NotificationCategory.valueOf(raw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private NotificationPriority parsePriority(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return NotificationPriority.valueOf(raw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private record ChannelPreferencePolicy(boolean mandatory, boolean defaultEnabled) {}

    private record AnnouncementResolution(String eventKey, Integer ownerId, List<User> recipients) {}

    private record NotificationTypeMetadata(
            NotificationCategory category, NotificationPriority priority, String actionLabel) {}
}
