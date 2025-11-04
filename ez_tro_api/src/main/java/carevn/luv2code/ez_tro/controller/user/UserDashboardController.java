package carevn.luv2code.ez_tro.controller.user;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.DashboardSummaryResponse;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.user.UserDashboardService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/dashboard")
@RequiredArgsConstructor
public class UserDashboardController {

    private final UserDashboardService userDashboardService;

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
