package carevn.luv2code.ez_tro.controller.user;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.UserChangePasswordRequest;
import carevn.luv2code.ez_tro.dto.requests.UserProfileUpdateRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.TenantDetailResponse;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.user.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    /**
     * Lấy thông tin my profile.
     */
    @GetMapping("/me")
    public ApiResponse<TenantDetailResponse> getMyProfile() {
        Integer userId = SecurityUtils.getCurrentUserId();
        TenantDetailResponse response = userProfileService.getMyProfile(userId);
        return ApiResponse.<TenantDetailResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy hồ sơ người thuê thành công")
                .result(response)
                .build();
    }

    /**
     * Cập nhật my profile.
     */
    @PutMapping("/me")
    public ApiResponse<TenantDetailResponse> updateMyProfile(@RequestBody UserProfileUpdateRequest request) {
        Integer userId = SecurityUtils.getCurrentUserId();
        TenantDetailResponse response = userProfileService.updateMyProfile(userId, request);
        return ApiResponse.<TenantDetailResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Cập nhật hồ sơ người thuê thành công")
                .result(response)
                .build();
    }

    /**
     * Thực thi change my password.
     */
    @PutMapping("/me/change-password")
    public ApiResponse<Void> changeMyPassword(@Valid @RequestBody UserChangePasswordRequest request) {
        Integer userId = SecurityUtils.getCurrentUserId();
        userProfileService.changeMyPassword(userId, request);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Đổi mật khẩu thành công")
                .build();
    }
}
