package carevn.luv2code.ez_tro.service.admin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import carevn.luv2code.ez_tro.dto.response.NotificationResponse;

public interface NotificationService {

    void sendToUser(Integer userId, String title, String message, String type, Object data);

    Page<NotificationResponse> getMyNotifications(Pageable pageable);

    void markAsRead(Integer notificationId);

    Integer countUnread();
}
