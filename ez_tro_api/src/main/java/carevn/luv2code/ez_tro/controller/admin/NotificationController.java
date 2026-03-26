package carevn.luv2code.ez_tro.controller.admin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.SendNotificationRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.NotificationResponse;
import carevn.luv2code.ez_tro.security.SecurityUtils;
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

    /**
     * Lấy danh sách thông báo của user hiện tại.
     *
     * @param page trang (0-based)
     * @param size kích thước trang
     * @return response chứa danh sách thông báo phân trang
     */
    @GetMapping("/me")
    public ApiResponse<Page<NotificationResponse>> getMyNotifications(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ApiResponse.<Page<NotificationResponse>>builder()
                .code(200)
                .message("Lấy thông báo thành công")
                .result(notificationService.getMyNotifications(pageable))
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
}
