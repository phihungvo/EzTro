package carevn.luv2code.ez_tro.controller.admin;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.SystemConfigRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.SystemConfigResponse;
import carevn.luv2code.ez_tro.service.admin.SystemConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST Controller quản lý cấu hình hệ thống (SystemConfig).
 *
 * <p>Các cấu hình được lưu dưới dạng key/value, dùng cho các tham số runtime của hệ thống (ví dụ: default plan).
 */
@RestController
@RequestMapping("/api/system-configs")
@RequiredArgsConstructor
public class SystemConfigController {

    private final SystemConfigService systemConfigService;

    /**
     * Tạo mới system config.
     *
     * @param request payload tạo config
     * @return response chứa config sau khi tạo
     */
    @PostMapping
    public ApiResponse<SystemConfigResponse> create(@Valid @RequestBody SystemConfigRequest request) {
        return ApiResponse.<SystemConfigResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("System config created successfully")
                .result(systemConfigService.create(request))
                .build();
    }

    /**
     * Lấy danh sách tất cả system config.
     *
     * @return response chứa danh sách config
     */
    @GetMapping
    public ApiResponse<List<SystemConfigResponse>> getAll() {
        return ApiResponse.<List<SystemConfigResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get all system configs successfully")
                .result(systemConfigService.getAll())
                .build();
    }

    /**
     * Lấy system config theo id.
     *
     * @param id id config
     * @return response chứa config
     */
    @GetMapping("/{id}")
    public ApiResponse<SystemConfigResponse> getById(@PathVariable Integer id) {
        return ApiResponse.<SystemConfigResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get system config successfully")
                .result(systemConfigService.getById(id))
                .build();
    }

    /**
     * Lấy system config theo key.
     *
     * @param key key config
     * @return response chứa config
     */
    @GetMapping("/key/{key}")
    public ApiResponse<SystemConfigResponse> getByKey(@PathVariable String key) {
        return ApiResponse.<SystemConfigResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get system config by key successfully")
                .result(systemConfigService.getByKey(key))
                .build();
    }

    /**
     * Cập nhật system config theo id.
     *
     * @param id id config
     * @param request payload cập nhật config
     * @return response chứa config sau khi cập nhật
     */
    @PutMapping("/{id}")
    public ApiResponse<SystemConfigResponse> update(
            @PathVariable Integer id, @Valid @RequestBody SystemConfigRequest request) {
        return ApiResponse.<SystemConfigResponse>builder()
                .code(HttpStatus.OK.value())
                .message("System config updated successfully")
                .result(systemConfigService.update(id, request))
                .build();
    }

    /**
     * Xóa system config theo id.
     *
     * @param id id config
     * @return response không có payload
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        systemConfigService.delete(id);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("System config deleted successfully")
                .build();
    }
}
