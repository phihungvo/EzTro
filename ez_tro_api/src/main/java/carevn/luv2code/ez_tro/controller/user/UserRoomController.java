package carevn.luv2code.ez_tro.controller.user;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.TenantRoomInfoResponse;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.owner.UserRoomInfoService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/room")
@RequiredArgsConstructor
public class UserRoomController {

    private final UserRoomInfoService userRoomInfoService;

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
}
