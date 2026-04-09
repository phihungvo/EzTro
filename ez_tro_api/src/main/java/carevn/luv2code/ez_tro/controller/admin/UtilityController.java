package carevn.luv2code.ez_tro.controller.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.UtilityRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.UtilityResponse;
import carevn.luv2code.ez_tro.service.admin.UtilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST Controller quản lý tiện ích/dịch vụ (Utility) của khu nhà trọ.
 *
 * <p>Utility thường được dùng để cấu hình giá điện/nước/dịch vụ và làm input cho billing.
 */
@RestController
@RequestMapping("/api/utilities")
@RequiredArgsConstructor
public class UtilityController {

    private final UtilityService utilityService;

    /**
     * Tạo mới utility.
     *
     * @param request payload tạo utility
     * @return response chứa utility vừa tạo
     */
    @PostMapping
    public ApiResponse<UtilityResponse> create(@Valid @RequestBody UtilityRequest request) {
        UtilityResponse response = utilityService.create(request);
        return ApiResponse.<UtilityResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Tạo tiện ích thành công")
                .result(response)
                .build();
    }

    /**
     * Cập nhật utility theo id.
     *
     * @param id id utility
     * @param request payload cập nhật utility
     * @return response chứa utility sau cập nhật
     */
    @PutMapping("/{id}")
    public ApiResponse<UtilityResponse> update(@PathVariable Integer id, @Valid @RequestBody UtilityRequest request) {
        UtilityResponse response = utilityService.update(id, request);
        return ApiResponse.<UtilityResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Cập nhật tiện ích thành công")
                .result(response)
                .build();
    }

    /**
     * Bật/tắt (active) tiện ích.
     *
     * @param id id utility
     * @param active trạng thái mong muốn
     * @return response chứa utility sau cập nhật
     */
    @PatchMapping("/{id}/status")
    public ApiResponse<UtilityResponse> updateStatus(
            @PathVariable Integer id, @RequestParam(defaultValue = "true") boolean active) {
        UtilityResponse response = utilityService.updateStatus(id, active);
        return ApiResponse.<UtilityResponse>builder()
                .code(HttpStatus.OK.value())
                .message(active ? "Đã bật tiện ích" : "Đã vô hiệu hóa tiện ích")
                .result(response)
                .build();
    }

    /**
     * Xóa utility theo id.
     *
     * @param id id utility
     * @return response không có payload
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        utilityService.delete(id);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.NO_CONTENT.value())
                .message("Xóa tiện ích thành công")
                .build();
    }

    /**
     * Lấy utility theo id.
     *
     * @param id id utility
     * @return response chứa utility
     */
    @GetMapping("/{id}")
    public ApiResponse<UtilityResponse> getById(@PathVariable Integer id) {
        UtilityResponse response = utilityService.getById(id);
        return ApiResponse.<UtilityResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy tiện ích thành công")
                .result(response)
                .build();
    }

    /**
     * Lấy danh sách utilities (theo role hiện tại).
     *
     * @return response chứa danh sách utilities
     */
    @GetMapping
    public ApiResponse<List<UtilityResponse>> getAll() {
        List<UtilityResponse> responses = utilityService.getAll();
        return ApiResponse.<List<UtilityResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy tất cả tiện ích thành công")
                .result(responses)
                .build();
    }

    /**
     * Lấy danh sách utilities phân trang.
     *
     * @param page trang (0-based)
     * @param size kích thước trang
     * @return response chứa page utilities
     */
    @GetMapping("/paged")
    public ApiResponse<Page<UtilityResponse>> getPaged(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Page<UtilityResponse> responses = utilityService.getAllPaged(page, size);
        return ApiResponse.<Page<UtilityResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy tiện ích phân trang thành công")
                .result(responses)
                .build();
    }

    /**
     * Lấy danh sách utilities theo khu nhà trọ.
     *
     * @param boardingHouseId id khu nhà trọ
     * @return response chứa danh sách utilities
     */
    @GetMapping("/boarding/{boardingHouseId}")
    public ApiResponse<List<UtilityResponse>> getByBoardingHouse(@PathVariable Integer boardingHouseId) {
        List<UtilityResponse> responses = utilityService.getByBoardingHouse(boardingHouseId);
        return ApiResponse.<List<UtilityResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy tiện ích theo khu nhà trọ thành công")
                .result(responses)
                .build();
    }

    /**
     * Lấy utilities active theo khu nhà trọ (phân trang).
     *
     * @param boardingHouseId id khu nhà trọ
     * @param page trang (0-based)
     * @param size kích thước trang
     * @return response chứa page utilities active
     */
    @GetMapping("/active/boarding/{boardingHouseId}")
    public ApiResponse<Page<UtilityResponse>> getActiveByBoardingHouse(
            @PathVariable Integer boardingHouseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<UtilityResponse> responses = utilityService.getActiveByBoardingHouse(boardingHouseId, page, size);
        return ApiResponse.<Page<UtilityResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy tiện ích active theo khu nhà trọ thành công")
                .result(responses)
                .build();
    }
}
