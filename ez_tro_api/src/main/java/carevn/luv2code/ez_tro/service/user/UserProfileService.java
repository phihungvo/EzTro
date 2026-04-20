package carevn.luv2code.ez_tro.service.user;

import carevn.luv2code.ez_tro.dto.requests.UserChangePasswordRequest;
import carevn.luv2code.ez_tro.dto.requests.UserProfileUpdateRequest;
import carevn.luv2code.ez_tro.dto.response.TenantDetailResponse;

public interface UserProfileService {
    /**
     * Lấy thông tin my profile.
     */
    TenantDetailResponse getMyProfile(Integer userId);

    /**
     * Cập nhật my profile.
     */
    TenantDetailResponse updateMyProfile(Integer userId, UserProfileUpdateRequest request);

    /**
     * Thực thi change my password.
     */
    void changeMyPassword(Integer userId, UserChangePasswordRequest request);
}
