package carevn.luv2code.ez_tro.job;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import carevn.luv2code.ez_tro.service.admin.impl.SubscriptionQuotaNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class SubscriptionQuotaNotificationJob {

    private final SubscriptionQuotaNotificationService subscriptionQuotaNotificationService;

    @Scheduled(cron = "${app.subscription.notification.cron:0 15 9 * * ?}")
    public void runDailySubscriptionAndQuotaAlerts() {
        int expiring = subscriptionQuotaNotificationService.sendOwnerSubscriptionExpiringAlerts();
        int expired = subscriptionQuotaNotificationService.sendOwnerSubscriptionExpiredAlerts();
        int quota = subscriptionQuotaNotificationService.sendOwnerQuotaAlerts();
        int total = expiring + expired + quota;
        if (total > 0) {
            log.info(
                    "Sent {} subscription/quota alerts (expiring={}, expired={}, quota={})",
                    total,
                    expiring,
                    expired,
                    quota);
        }
    }
}
