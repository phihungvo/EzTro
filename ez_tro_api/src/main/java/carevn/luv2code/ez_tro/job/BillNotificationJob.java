package carevn.luv2code.ez_tro.job;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import carevn.luv2code.ez_tro.service.admin.impl.BillingNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class BillNotificationJob {

    private final BillingNotificationService billingNotificationService;

    @Scheduled(cron = "${app.billing.notification.reminder-cron:0 30 8 * * ?}")
    public void runDailyReminders() {
        log.info("Running scheduled bill reminder job");
        billingNotificationService.sendUpcomingDueReminders();
    }
}
