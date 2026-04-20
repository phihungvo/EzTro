package carevn.luv2code.ez_tro.service.admin.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Component;

import carevn.luv2code.ez_tro.dto.requests.MailRequest;
import carevn.luv2code.ez_tro.entity.NotificationDeliveryLog;
import carevn.luv2code.ez_tro.enums.NotificationChannel;
import carevn.luv2code.ez_tro.enums.NotificationDeliveryStatus;
import carevn.luv2code.ez_tro.service.admin.MailService;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class EmailNotificationChannelSender implements NotificationChannelSender {

    private final MailService mailService;

    @Override
    public NotificationChannel getChannel() {
        return NotificationChannel.EMAIL;
    }

    @Override
    public DeliveryAttemptResult send(NotificationDeliveryLog log) {
        MailRequest request = new MailRequest();
        request.setTo(List.of(log.getDestination()));
        request.setSubject(log.getTitle());
        request.setBody(log.getMessage());
        request.setHtml(false);
        mailService.send(request);

        return new DeliveryAttemptResult(
                NotificationDeliveryStatus.SENT,
                "MAIL-" + log.getId() + "-" + System.currentTimeMillis(),
                "{\"provider\":\"SMTP\",\"sentAt\":\"" + LocalDateTime.now() + "\"}",
                null);
    }
}
