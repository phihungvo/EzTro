package carevn.luv2code.ez_tro.service.admin.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.response.OwnerLimitsResponse;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.entity.UserSubscription;
import carevn.luv2code.ez_tro.enums.SubscriptionStatus;
import carevn.luv2code.ez_tro.repository.UserSubscriptionRepository;
import carevn.luv2code.ez_tro.service.admin.NotificationService;
import carevn.luv2code.ez_tro.service.admin.UserSubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SubscriptionQuotaNotificationService {

    private static final double DEFAULT_WARNING_THRESHOLD = 0.8d;

    private final UserSubscriptionRepository userSubscriptionRepository;
    private final UserSubscriptionService userSubscriptionService;
    private final NotificationService notificationService;

    @Value("${app.subscription.notification.expiring-days:7,3,1}")
    private String expiringDaysConfig;

    @Value("${app.subscription.quota.warning-threshold:0.8}")
    private double quotaWarningThreshold;

    public int sendOwnerSubscriptionExpiringAlerts() {
        List<Integer> daysList = parseDays(expiringDaysConfig);
        if (daysList.isEmpty()) {
            return 0;
        }

        int maxDay = daysList.stream().max(Integer::compareTo).orElse(0);
        LocalDateTime from = LocalDate.now().atStartOfDay();
        LocalDateTime to = LocalDate.now().plusDays(maxDay).atTime(LocalTime.MAX);

        List<UserSubscription> expiring =
                userSubscriptionRepository.findAllExpiringBetween(SubscriptionStatus.ACTIVE, from, to);

        int sent = 0;
        for (UserSubscription subscription : expiring) {
            if (subscription == null || subscription.getEndDate() == null) {
                continue;
            }
            LocalDate endDate = subscription.getEndDate().toLocalDate();
            long daysLeft = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), endDate);
            if (!daysList.contains((int) daysLeft)) {
                continue;
            }

            User owner = subscription.getOwner();
            if (owner == null || owner.getId() == null) {
                continue;
            }

            try {
                Map<String, Object> payload = new LinkedHashMap<>();
                payload.put("subscriptionId", subscription.getId());
                payload.put(
                        "planCode",
                        subscription.getPlan() != null ? subscription.getPlan().getCode() : null);
                payload.put(
                        "planName",
                        subscription.getPlan() != null ? subscription.getPlan().getName() : null);
                payload.put("endDate", subscription.getEndDate().toString());
                payload.put("daysLeft", (int) daysLeft);
                payload.put("dedupeKey", "owner-subscription-expiring-" + subscription.getId() + "-" + endDate);

                notificationService.sendToUser(
                        owner.getId(),
                        "Gói dịch vụ sắp hết hạn",
                        "Gói dịch vụ của bạn sẽ hết hạn vào ngày " + endDate + " (còn " + daysLeft + " ngày).",
                        "OWNER_SUBSCRIPTION_EXPIRING",
                        payload);
                sent++;
            } catch (Exception ex) {
                log.warn(
                        "Failed to send subscription expiring alert for subscription {}: {}",
                        subscription.getId(),
                        ex.getMessage());
            }
        }

        return sent;
    }

    public int sendOwnerSubscriptionExpiredAlerts() {
        List<UserSubscription> expiredButStillActive =
                userSubscriptionRepository.findAllExpiredButStillActive(SubscriptionStatus.ACTIVE);
        int sent = 0;

        for (UserSubscription subscription : expiredButStillActive) {
            if (subscription == null || subscription.getEndDate() == null) {
                continue;
            }
            User owner = subscription.getOwner();
            if (owner == null || owner.getId() == null) {
                continue;
            }
            LocalDate endDate = subscription.getEndDate().toLocalDate();
            try {
                Map<String, Object> payload = new LinkedHashMap<>();
                payload.put("subscriptionId", subscription.getId());
                payload.put(
                        "planCode",
                        subscription.getPlan() != null ? subscription.getPlan().getCode() : null);
                payload.put(
                        "planName",
                        subscription.getPlan() != null ? subscription.getPlan().getName() : null);
                payload.put("endDate", subscription.getEndDate().toString());
                payload.put("dedupeKey", "owner-subscription-expired-" + subscription.getId() + "-" + endDate);

                notificationService.sendToUser(
                        owner.getId(),
                        "Gói dịch vụ đã hết hạn",
                        "Gói dịch vụ của bạn đã hết hạn vào ngày " + endDate + ". Vui lòng gia hạn để tránh gián đoạn.",
                        "OWNER_SUBSCRIPTION_EXPIRED",
                        payload);
                sent++;
            } catch (Exception ex) {
                log.warn(
                        "Failed to send subscription expired alert for subscription {}: {}",
                        subscription.getId(),
                        ex.getMessage());
            }
        }

        return sent;
    }

    public int sendOwnerQuotaAlerts() {
        List<UserSubscription> activeSubscriptions =
                userSubscriptionRepository.findAllActive(SubscriptionStatus.ACTIVE);
        if (activeSubscriptions.isEmpty()) {
            return 0;
        }

        double threshold = quotaWarningThreshold > 0 ? quotaWarningThreshold : DEFAULT_WARNING_THRESHOLD;
        threshold = Math.min(0.99d, Math.max(0.5d, threshold));

        int sent = 0;
        for (UserSubscription subscription : activeSubscriptions) {
            User owner = subscription.getOwner();
            if (owner == null || owner.getId() == null) {
                continue;
            }

            try {
                OwnerLimitsResponse limits = userSubscriptionService.getCurrentLimits(owner.getId());
                QuotaAssessment assessment = assessQuota(limits, threshold);
                if (!assessment.shouldNotify()) {
                    continue;
                }

                Map<String, Object> payload = new LinkedHashMap<>();
                payload.put("subscriptionId", subscription.getId());
                payload.put("planName", limits != null ? limits.getPlanName() : null);
                payload.put("quota", assessment.quotaSnapshot());
                payload.put("breaches", assessment.breaches());
                payload.put("threshold", threshold);
                payload.put(
                        "dedupeKey",
                        "owner-quota-" + assessment.level().name().toLowerCase(Locale.ROOT)
                                + "-" + owner.getId()
                                + "-" + LocalDate.now()
                                + "-" + String.join("-", assessment.breaches()));

                String message = assessment.level() == QuotaLevel.EXCEEDED
                        ? "Bạn đã vượt giới hạn gói (quota). Vui lòng nâng cấp gói hoặc giảm sử dụng."
                        : "Bạn sắp chạm giới hạn gói (quota). Nên nâng cấp gói để tránh bị chặn thao tác tạo mới.";

                notificationService.sendToUser(
                        owner.getId(),
                        assessment.level() == QuotaLevel.EXCEEDED ? "Vượt quota gói" : "Sắp chạm quota gói",
                        message + " (" + String.join(", ", assessment.breachSummaries()) + ")",
                        assessment.level() == QuotaLevel.EXCEEDED ? "OWNER_QUOTA_EXCEEDED" : "OWNER_QUOTA_WARNING",
                        payload);
                sent++;
            } catch (Exception ex) {
                log.warn("Failed to evaluate quota for owner {}: {}", owner.getId(), ex.getMessage());
            }
        }

        return sent;
    }

    private QuotaAssessment assessQuota(OwnerLimitsResponse limits, double threshold) {
        if (limits == null) {
            return QuotaAssessment.none();
        }

        List<QuotaItem> items = List.of(
                new QuotaItem("BOARDING_HOUSES", limits.getCurrentBoardingHouses(), limits.getMaxBoardingHouses()),
                new QuotaItem("BUILDINGS", limits.getCurrentBuildings(), limits.getMaxBuildings()),
                new QuotaItem("ROOMS", limits.getCurrentRooms(), limits.getMaxRooms()),
                new QuotaItem("TENANTS", limits.getCurrentTenants(), limits.getMaxTenants()),
                new QuotaItem("CONTRACTS", limits.getCurrentContracts(), limits.getMaxContracts()));

        List<String> exceeded = new ArrayList<>();
        List<String> warning = new ArrayList<>();
        List<String> summaries = new ArrayList<>();
        Map<String, Object> quotaSnapshot = new LinkedHashMap<>();

        for (QuotaItem item : items) {
            if (item.max <= 0) {
                continue;
            }
            double ratio = (double) item.current / (double) item.max;
            quotaSnapshot.put(
                    item.code,
                    Map.of("current", item.current, "max", item.max, "ratio", Math.round(ratio * 100.0) / 100.0));
            if (item.current >= item.max) {
                exceeded.add(item.code);
                summaries.add(item.code + " " + item.current + "/" + item.max);
                continue;
            }
            if (ratio >= threshold) {
                warning.add(item.code);
                summaries.add(item.code + " " + item.current + "/" + item.max);
            }
        }

        if (!exceeded.isEmpty()) {
            return new QuotaAssessment(QuotaLevel.EXCEEDED, exceeded, summaries, quotaSnapshot);
        }
        if (!warning.isEmpty()) {
            return new QuotaAssessment(QuotaLevel.WARNING, warning, summaries, quotaSnapshot);
        }
        return QuotaAssessment.none();
    }

    private List<Integer> parseDays(String config) {
        if (config == null || config.isBlank()) {
            return List.of();
        }
        return Arrays.stream(config.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .map(this::safeParseDay)
                .filter(day -> day != null && day >= 0)
                .distinct()
                .toList();
    }

    private Integer safeParseDay(String value) {
        try {
            return Integer.valueOf(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private enum QuotaLevel {
        WARNING,
        EXCEEDED
    }

    private record QuotaItem(String code, long current, long max) {}

    private record QuotaAssessment(
            QuotaLevel level, List<String> breaches, List<String> breachSummaries, Map<String, Object> quotaSnapshot) {
        static QuotaAssessment none() {
            return new QuotaAssessment(null, List.of(), List.of(), Map.of());
        }

        boolean shouldNotify() {
            return level != null && breaches != null && !breaches.isEmpty();
        }
    }
}
