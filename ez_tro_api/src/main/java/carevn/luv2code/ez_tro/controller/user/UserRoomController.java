package carevn.luv2code.ez_tro.controller.user;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.CurrentRentalInfoResponse;
import carevn.luv2code.ez_tro.dto.response.TenantRoomInfoResponse;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.user.UserRoomInfoService;
import lombok.RequiredArgsConstructor;

/**
 * REST Controller cung cấp thông tin phòng/hợp đồng hiện tại cho người thuê.
 *
 * <p>Các endpoint mặc định lấy {@code userId} từ {@link SecurityUtils}.
 */
@RestController
@RequestMapping("/api/user/room")
@RequiredArgsConstructor
public class UserRoomController {

    private final UserRoomInfoService userRoomInfoService;

    /**
     * Lấy thông tin phòng hiện tại của user (room number, building, diện tích...).
     *
     * @return response chứa thông tin phòng hiện tại
     */
    @GetMapping("/current")
    public ApiResponse<TenantRoomInfoResponse> getCurrentRoomInfo2() {
        Integer userId = SecurityUtils.getCurrentUserId();
        TenantRoomInfoResponse response = userRoomInfoService.getCurrentRoomInfo(userId);
        return ApiResponse.<TenantRoomInfoResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy thông tin phòng hiện tại của người dùng thành công")
                .result(response)
                .build();
    }

    /**
     * Lấy thông tin hợp đồng hiện tại của user (kỳ hạn, giá thuê, cọc...).
     *
     * @return response chứa thông tin hợp đồng hiện tại
     */
    @GetMapping("/current-contract")
    public ApiResponse<CurrentRentalInfoResponse> getCurrentContractInfo() {
        Integer userId = SecurityUtils.getCurrentUserId();
        CurrentRentalInfoResponse response = userRoomInfoService.getCurrentContractInfo(userId);
        return ApiResponse.<CurrentRentalInfoResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy thông tin hợp đồng hiện tại thành công")
                .result(response)
                .build();
    }
}
