package carevn.luv2code.ez_tro.controller.admin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.NotificationResponse;
import carevn.luv2code.ez_tro.service.admin.NotificationService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

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

    @GetMapping("/unread-count")
    public ApiResponse<Integer> countUnread() {
        return ApiResponse.<Integer>builder()
                .code(200)
                .result(notificationService.countUnread())
                .build();
    }

    @PostMapping("/read/{id}")
    public ApiResponse<Void> markAsRead(@PathVariable Integer id) {
        notificationService.markAsRead(id);
        return ApiResponse.<Void>builder().code(200).message("Đã đọc").build();
    }
}
