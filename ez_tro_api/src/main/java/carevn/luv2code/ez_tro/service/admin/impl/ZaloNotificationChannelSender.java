package carevn.luv2code.ez_tro.service.admin.impl;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import carevn.luv2code.ez_tro.entity.NotificationDeliveryLog;
import carevn.luv2code.ez_tro.enums.NotificationChannel;
import carevn.luv2code.ez_tro.enums.NotificationDeliveryStatus;

@Component
public class ZaloNotificationChannelSender implements NotificationChannelSender {

    @Value("${app.notifications.channels.zalo.enabled:false}")
    private boolean zaloEnabled;

    @Value("${app.notifications.channels.zalo.simulate:true}")
    private boolean zaloSimulate;

    @Override
    public NotificationChannel getChannel() {
        return NotificationChannel.ZALO;
    }

    @Override
    public DeliveryAttemptResult send(NotificationDeliveryLog log) {
        if (!zaloEnabled && !zaloSimulate) {
            return new DeliveryAttemptResult(
                    NotificationDeliveryStatus.SKIPPED, null, null, "Zalo provider chưa được cấu hình");
        }

        return new DeliveryAttemptResult(
                NotificationDeliveryStatus.SENT,
                "ZALO-" + log.getId() + "-" + System.currentTimeMillis(),
                "{\"provider\":\"ZALO_STUB\",\"simulate\":"
                        + (!zaloEnabled && zaloSimulate)
                        + ",\"sentAt\":\""
                        + LocalDateTime.now()
                        + "\"}",
                null);
    }
}
