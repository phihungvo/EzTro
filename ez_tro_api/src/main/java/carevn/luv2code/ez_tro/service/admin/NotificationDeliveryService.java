package carevn.luv2code.ez_tro.service.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import carevn.luv2code.ez_tro.dto.response.NotificationDeliveryLogResponse;
import carevn.luv2code.ez_tro.entity.NotificationEvent;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.NotificationCategory;
import carevn.luv2code.ez_tro.enums.NotificationPriority;

public interface NotificationDeliveryService {
    void queueExternalDeliveries(
            NotificationEvent event,
            String eventKey,
            String title,
            String message,
            String payloadJson,
            NotificationCategory category,
            NotificationPriority priority,
            List<User> recipients);

    Page<NotificationDeliveryLogResponse> getDeliveryLogs(
            Pageable pageable, String channel, String status, Integer eventId, String keyword);

    int processPendingDeliveries(int limit);
}
