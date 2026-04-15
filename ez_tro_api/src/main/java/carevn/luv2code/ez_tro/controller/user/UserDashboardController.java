package carevn.luv2code.ez_tro.controller.user;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.DashboardSummaryResponse;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.user.UserDashboardService;
import lombok.RequiredArgsConstructor;

/**
 * REST Controller dashboard phía người thuê.
 *
 * <p>Các endpoint tổng hợp thông tin hiển thị trên dashboard (ví dụ: phòng hiện tại, hóa đơn gần nhất...).
 */
@RestController
@RequestMapping("/api/user/dashboard")
@RequiredArgsConstructor
public class UserDashboardController {

    private final UserDashboardService userDashboardService;

    /**
     * Lấy thông tin tổng hợp cho dashboard của user hiện tại.
     *
     * @return response chứa summary dashboard
     */
    @GetMapping("/summary")
    public ApiResponse<DashboardSummaryResponse> getTenantSummaryInfo() {
        Integer userId = SecurityUtils.getCurrentUserId();
        DashboardSummaryResponse response = userDashboardService.getTenantSummaryInfoByUserId(userId);
        return ApiResponse.<DashboardSummaryResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy thông tin người thuê cơ bản thành công")
                .result(response)
                .build();
    }
}
