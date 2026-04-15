package carevn.luv2code.ez_tro.controller.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.RoomUtilityRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.RoomUtilityResponse;
import carevn.luv2code.ez_tro.service.admin.RoomUtilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST Controller quản lý đăng ký tiện ích theo phòng (RoomUtility).
 *
 * <p>RoomUtility là mapping giữa Room và Utility (có thể kèm quantity/start/end date... tùy thiết kế).
 */
@RestController
@RequestMapping("/api/room-utilities")
@RequiredArgsConstructor
public class RoomUtilityController {

    private final RoomUtilityService roomUtilityService;

    /**
     * Tạo mới đăng ký tiện ích cho phòng.
     *
     * @param request payload đăng ký
     * @return response chứa room-utility vừa tạo
     */
    @PostMapping
    public ApiResponse<RoomUtilityResponse> create(@Valid @RequestBody RoomUtilityRequest request) {
        RoomUtilityResponse response = roomUtilityService.create(request);
        return ApiResponse.<RoomUtilityResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Đăng ký dịch vụ thành công")
                .result(response)
                .build();
    }

    /**
     * Cập nhật đăng ký tiện ích theo cặp (roomId, utilityId).
     *
     * @param roomId id phòng
     * @param utilityId id tiện ích
     * @param request payload cập nhật
     * @return response chứa room-utility sau cập nhật
     */
    @PutMapping("/{roomId}/{utilityId}")
    public ApiResponse<RoomUtilityResponse> update(
            @PathVariable Integer roomId,
            @PathVariable Integer utilityId,
            @Valid @RequestBody RoomUtilityRequest request) {
        RoomUtilityResponse response = roomUtilityService.update(roomId, utilityId, request);
        return ApiResponse.<RoomUtilityResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Cập nhật đăng ký dịch vụ thành công")
                .result(response)
                .build();
    }

    /**
     * Xóa đăng ký tiện ích theo cặp (roomId, utilityId).
     *
     * @param roomId id phòng
     * @param utilityId id tiện ích
     * @return response không có payload
     */
    @DeleteMapping("/{roomId}/{utilityId}")
    public ApiResponse<Void> delete(@PathVariable Integer roomId, @PathVariable Integer utilityId) {
        roomUtilityService.delete(roomId, utilityId);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.NO_CONTENT.value())
                .message("Hủy đăng ký dịch vụ thành công")
                .build();
    }

    /**
     * Lấy chi tiết đăng ký tiện ích theo cặp (roomId, utilityId).
     *
     * @param roomId id phòng
     * @param utilityId id tiện ích
     * @return response chứa room-utility
     */
    @GetMapping("/{roomId}/{utilityId}")
    public ApiResponse<RoomUtilityResponse> getById(@PathVariable Integer roomId, @PathVariable Integer utilityId) {
        RoomUtilityResponse response = roomUtilityService.getById(roomId, utilityId);
        return ApiResponse.<RoomUtilityResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy đăng ký dịch vụ thành công")
                .result(response)
                .build();
    }

    /**
     * Lấy danh sách tất cả đăng ký tiện ích theo phòng.
     *
     * @param roomId id phòng
     * @return response chứa danh sách room-utilities
     */
    @GetMapping("/room/{roomId}")
    public ApiResponse<List<RoomUtilityResponse>> getByRoomId(@PathVariable Integer roomId) {
        List<RoomUtilityResponse> responses = roomUtilityService.getByRoomId(roomId);
        return ApiResponse.<List<RoomUtilityResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy tất cả dịch vụ theo phòng thành công")
                .result(responses)
                .build();
    }

    /**
     * Lấy danh sách đăng ký tiện ích active theo phòng.
     *
     * @param roomId id phòng
     * @return response chứa danh sách active
     */
    @GetMapping("/room/{roomId}/active")
    public ApiResponse<List<RoomUtilityResponse>> getActiveByRoomId(@PathVariable Integer roomId) {
        List<RoomUtilityResponse> responses = roomUtilityService.getActiveByRoomId(roomId);
        return ApiResponse.<List<RoomUtilityResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy dịch vụ active theo phòng thành công")
                .result(responses)
                .build();
    }

    /**
     * Lấy danh sách đăng ký theo utility.
     *
     * @param utilityId id utility
     * @return response chứa danh sách room-utilities
     */
    @GetMapping("/utility/{utilityId}")
    public ApiResponse<List<RoomUtilityResponse>> getByUtilityId(@PathVariable Integer utilityId) {
        List<RoomUtilityResponse> responses = roomUtilityService.getByUtilityId(utilityId);
        return ApiResponse.<List<RoomUtilityResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy đăng ký theo tiện ích thành công")
                .result(responses)
                .build();
    }

    /**
     * Lấy danh sách room-utilities theo phòng (phân trang).
     *
     * @param roomId id phòng
     * @param page trang (0-based)
     * @param size kích thước trang
     * @return response chứa page room-utilities
     */
    @GetMapping("/room/{roomId}/paged")
    public ApiResponse<Page<RoomUtilityResponse>> getByRoomIdPaged(
            @PathVariable Integer roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<RoomUtilityResponse> responses = roomUtilityService.getByRoomIdPaged(roomId, page, size);
        return ApiResponse.<Page<RoomUtilityResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy đăng ký dịch vụ theo phòng phân trang thành công")
                .result(responses)
                .build();
    }

    /**
     * Lấy danh sách tất cả room-utilities (phân trang).
     *
     * @param page trang (0-based)
     * @param size kích thước trang
     * @return response chứa page room-utilities
     */
    @GetMapping("/all-paged")
    public ApiResponse<Page<RoomUtilityResponse>> getAllPaged(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Page<RoomUtilityResponse> responses = roomUtilityService.getAllPaged(page, size);
        return ApiResponse.<Page<RoomUtilityResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy tất cả đăng ký dịch vụ phân trang thành công")
                .result(responses)
                .build();
    }
}
