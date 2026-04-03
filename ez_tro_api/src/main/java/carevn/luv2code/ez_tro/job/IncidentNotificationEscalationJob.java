package carevn.luv2code.ez_tro.job;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import carevn.luv2code.ez_tro.service.admin.IncidentNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class IncidentNotificationEscalationJob {

    private final IncidentNotificationService incidentNotificationService;

    @Scheduled(cron = "${app.incidents.notification.escalation.cron:0 0 9 * * ?}")
    public void runEscalation() {
        int escalated = incidentNotificationService.sendSlaEscalations();
        if (escalated > 0) {
            log.info("Escalated {} overdue incidents", escalated);
        }
    }
}
