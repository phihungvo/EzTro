package carevn.luv2code.ez_tro.service.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import carevn.luv2code.ez_tro.dto.requests.NotificationAnnouncementRequest;
import carevn.luv2code.ez_tro.dto.requests.NotificationPreferencesUpdateRequest;
import carevn.luv2code.ez_tro.dto.response.NotificationAnnouncementPreviewResponse;
import carevn.luv2code.ez_tro.dto.response.NotificationPreferencesResponse;
import carevn.luv2code.ez_tro.dto.response.NotificationResponse;

/**
 * Service contract quản lý thông báo (Notification) và thao tác read/unread.
 */
public interface NotificationService {

    void sendToUser(Integer userId, String title, String message, String type, Object data);

    void sendToUsers(List<Integer> userIds, String title, String message, String type, Object data);

    Page<NotificationResponse> getMyNotifications(Pageable pageable, String status, String category, String keyword);

    void markAsRead(Integer notificationId);

    long countUnread();

    void sendToAll(String title, String message, String type, Object data);

    void sendToAllTenantsOfOwner(Integer ownerId, String title, String message, String type, Object data);

    void sendBillReminder(Integer billId);

    void markAllAsRead();

    void archive(Integer notificationId);

    NotificationAnnouncementPreviewResponse previewAnnouncement(NotificationAnnouncementRequest request);

    NotificationAnnouncementPreviewResponse sendAnnouncement(NotificationAnnouncementRequest request);

    NotificationPreferencesResponse getMyPreferences();

    NotificationPreferencesResponse updateMyPreferences(NotificationPreferencesUpdateRequest request);
}
