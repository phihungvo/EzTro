package carevn.luv2code.ez_tro.service.admin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import carevn.luv2code.ez_tro.dto.response.NotificationResponse;

/**
 * Service contract quản lý thông báo (Notification) và thao tác read/unread.
 */
public interface NotificationService {

    void sendToUser(Integer userId, String title, String message, String type, Object data);

    Page<NotificationResponse> getMyNotifications(Pageable pageable);

    void markAsRead(Integer notificationId);

    long countUnread();

    void sendToAll(String title, String message, String type, Object data);

    void sendToAllTenantsOfOwner(Integer ownerId, String title, String message, String type, Object data);

    void sendBillReminder(Integer billId);

    void markAllAsRead();
}
