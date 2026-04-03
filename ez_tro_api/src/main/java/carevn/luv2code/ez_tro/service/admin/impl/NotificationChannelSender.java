package carevn.luv2code.ez_tro.service.admin.impl;

import carevn.luv2code.ez_tro.entity.NotificationDeliveryLog;
import carevn.luv2code.ez_tro.enums.NotificationChannel;
import carevn.luv2code.ez_tro.enums.NotificationDeliveryStatus;

public interface NotificationChannelSender {
    NotificationChannel getChannel();

    DeliveryAttemptResult send(NotificationDeliveryLog log);

    record DeliveryAttemptResult(
            NotificationDeliveryStatus status, String providerMessageId, String responseJson, String errorMessage) {}
}
