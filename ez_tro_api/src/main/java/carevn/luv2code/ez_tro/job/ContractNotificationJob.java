package carevn.luv2code.ez_tro.job;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import carevn.luv2code.ez_tro.service.admin.impl.ContractNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class ContractNotificationJob {

    private final ContractNotificationService contractNotificationService;

    @Scheduled(cron = "${app.contracts.notification.expiring-cron:0 0 9 * * ?}")
    public void runContractExpiringReminders() {
        int sent = contractNotificationService.sendOwnerContractExpiringReminders();
        if (sent > 0) {
            log.info("Sent {} owner contract expiring reminders", sent);
        }
    }
}
