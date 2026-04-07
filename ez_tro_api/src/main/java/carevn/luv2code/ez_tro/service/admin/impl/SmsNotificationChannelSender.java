package carevn.luv2code.ez_tro.service.admin.impl;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import carevn.luv2code.ez_tro.entity.NotificationDeliveryLog;
import carevn.luv2code.ez_tro.enums.NotificationChannel;
import carevn.luv2code.ez_tro.enums.NotificationDeliveryStatus;

@Component
public class SmsNotificationChannelSender implements NotificationChannelSender {

    @Value("${app.notifications.channels.sms.enabled:false}")
    private boolean smsEnabled;

    @Value("${app.notifications.channels.sms.simulate:true}")
    private boolean smsSimulate;

    @Override
    public NotificationChannel getChannel() {
        return NotificationChannel.SMS;
    }

    @Override
    public DeliveryAttemptResult send(NotificationDeliveryLog log) {
        if (!smsEnabled && !smsSimulate) {
            return new DeliveryAttemptResult(
                    NotificationDeliveryStatus.SKIPPED, null, null, "SMS provider chưa được cấu hình");
        }

        return new DeliveryAttemptResult(
                NotificationDeliveryStatus.SENT,
                "SMS-" + log.getId() + "-" + System.currentTimeMillis(),
                "{\"provider\":\"SMS_STUB\",\"simulate\":"
                        + (!smsEnabled && smsSimulate)
                        + ",\"sentAt\":\""
                        + LocalDateTime.now()
                        + "\"}",
                null);
    }
}
