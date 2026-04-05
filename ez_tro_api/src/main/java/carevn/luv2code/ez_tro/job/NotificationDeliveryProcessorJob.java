package carevn.luv2code.ez_tro.job;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import carevn.luv2code.ez_tro.service.admin.NotificationDeliveryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationDeliveryProcessorJob {

    private final NotificationDeliveryService notificationDeliveryService;

    @Scheduled(fixedDelayString = "${app.notifications.delivery.processor.fixed-delay-ms:60000}")
    public void processPendingDeliveries() {
        int processed = notificationDeliveryService.processPendingDeliveries(50);
        if (processed > 0) {
            log.info("Processed {} queued notification delivery logs", processed);
        }
    }
}
