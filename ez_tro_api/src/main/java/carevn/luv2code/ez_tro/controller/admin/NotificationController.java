package carevn.luv2code.ez_tro.controller.admin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.NotificationAnnouncementRequest;
import carevn.luv2code.ez_tro.dto.requests.NotificationPreferencesUpdateRequest;
import carevn.luv2code.ez_tro.dto.requests.SendNotificationRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.NotificationAnnouncementPreviewResponse;
import carevn.luv2code.ez_tro.dto.response.NotificationDeliveryLogResponse;
import carevn.luv2code.ez_tro.dto.response.NotificationPreferencesResponse;
import carevn.luv2code.ez_tro.dto.response.NotificationResponse;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.NotificationDeliveryService;
import carevn.luv2code.ez_tro.service.admin.NotificationService;
import lombok.RequiredArgsConstructor;

/**
 * REST Controller quản lý thông báo (notifications) cho người dùng.
 *
 * <p>Endpoint hỗ trợ:
 * <ul>
 *   <li>Lấy danh sách thông báo của user hiện tại (phân trang).</li>
 *   <li>Đếm unread, đánh dấu đã đọc, đánh dấu tất cả đã đọc.</li>
 *   <li>Gửi broadcast hoặc gửi tới tenant thuộc owner.</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationDeliveryService notificationDeliveryService;

    /**
     * Lấy danh sách thông báo của user hiện tại.
     *
     * @param page trang (0-based)
     * @param size kích thước trang
     * @return response chứa danh sách thông báo phân trang
     */
    @GetMapping("/me")
    public ApiResponse<Page<NotificationResponse>> getMyNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword) {
        Pageable pageable = PageRequest.of(page, size);
        return ApiResponse.<Page<NotificationResponse>>builder()
                .code(200)
                .message("Lấy thông báo thành công")
                .result(notificationService.getMyNotifications(pageable, status, category, keyword))
                .build();
    }

    /**
     * Đếm số thông báo chưa đọc của user hiện tại.
     *
     * @return response chứa unread count
     */
    @GetMapping("/unread-count")
    public ApiResponse<Long> countUnread() {
        return ApiResponse.<Long>builder()
                .code(200)
                .result(notificationService.countUnread())
                .build();
    }

    /**
     * Đánh dấu một thông báo đã đọc.
     *
     * @param id id notification
     * @return response không có payload
     */
    @PostMapping("/read/{id}")
    public ApiResponse<Void> markAsRead(@PathVariable Integer id) {
        notificationService.markAsRead(id);
        return ApiResponse.<Void>builder().code(200).message("Đã đọc").build();
    }

    /**
     * Gửi broadcast notification tới tất cả user.
     *
     * @param req payload thông báo
     * @return response không có payload
     */
    @PostMapping("/broadcast")
    public ApiResponse<Void> sendBroadcast(@RequestBody SendNotificationRequest req) {
        notificationService.sendToAll(req.getTitle(), req.getMessage(), req.getType(), req.getData());
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Gửi thông báo toàn hệ thống thành công")
                .build();
    }

    /**
     * Gửi thông báo tới tất cả tenant thuộc owner hiện tại.
     *
     * @param req payload thông báo
     * @return response không có payload
     */
    @PostMapping("/tenants")
    public ApiResponse<Void> sendToMyTenants(@RequestBody SendNotificationRequest req) {
        notificationService.sendToAllTenantsOfOwner(
                SecurityUtils.getCurrentUserId(), req.getTitle(), req.getMessage(), req.getType(), req.getData());
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Đã gửi cho tất cả khách thuê")
                .build();
    }

    /**
     * Đánh dấu tất cả thông báo của user hiện tại là đã đọc.
     *
     * @return response không có payload
     */
    @PostMapping("/read-all")
    public ApiResponse<Void> markAllAsRead() {
        notificationService.markAllAsRead();
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Đã đánh dấu tất cả đã đọc")
                .build();
    }

    @PostMapping("/archive/{id}")
    public ApiResponse<Void> archive(@PathVariable Integer id) {
        notificationService.archive(id);
        return ApiResponse.<Void>builder()
                .code(200)
                .message("Đã lưu trữ thông báo")
                .build();
    }

    @PostMapping("/announcements/preview")
    public ApiResponse<NotificationAnnouncementPreviewResponse> previewAnnouncement(
            @RequestBody NotificationAnnouncementRequest request) {
        return ApiResponse.<NotificationAnnouncementPreviewResponse>builder()
                .code(200)
                .message("Preview danh sách người nhận thành công")
                .result(notificationService.previewAnnouncement(request))
                .build();
    }

    @PostMapping("/announcements")
    public ApiResponse<NotificationAnnouncementPreviewResponse> sendAnnouncement(
            @RequestBody NotificationAnnouncementRequest request) {
        return ApiResponse.<NotificationAnnouncementPreviewResponse>builder()
                .code(200)
                .message("Gửi thông báo thành công")
                .result(notificationService.sendAnnouncement(request))
                .build();
    }

    @GetMapping("/preferences/me")
    public ApiResponse<NotificationPreferencesResponse> getMyPreferences() {
        return ApiResponse.<NotificationPreferencesResponse>builder()
                .code(200)
                .message("Lấy cài đặt thông báo thành công")
                .result(notificationService.getMyPreferences())
                .build();
    }

    @PutMapping("/preferences/me")
    public ApiResponse<NotificationPreferencesResponse> updateMyPreferences(
            @RequestBody NotificationPreferencesUpdateRequest request) {
        return ApiResponse.<NotificationPreferencesResponse>builder()
                .code(200)
                .message("Cập nhật cài đặt thông báo thành công")
                .result(notificationService.updateMyPreferences(request))
                .build();
    }

    @GetMapping("/delivery-logs")
    public ApiResponse<Page<NotificationDeliveryLogResponse>> getDeliveryLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String channel,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer eventId,
            @RequestParam(required = false) String keyword) {
        Pageable pageable = PageRequest.of(page, size);
        return ApiResponse.<Page<NotificationDeliveryLogResponse>>builder()
                .code(200)
                .message("Lấy audit log notification delivery thành công")
                .result(notificationDeliveryService.getDeliveryLogs(pageable, channel, status, eventId, keyword))
                .build();
    }

    @PostMapping("/delivery-logs/process-pending")
    public ApiResponse<Integer> processPendingDeliveries(@RequestParam(defaultValue = "50") int limit) {
        return ApiResponse.<Integer>builder()
                .code(200)
                .message("Đã xử lý hàng đợi notification delivery")
                .result(notificationDeliveryService.processPendingDeliveries(limit))
                .build();
    }
}
