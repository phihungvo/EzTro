package carevn.luv2code.ez_tro.controller.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.PermissionDTO;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.service.admin.PermissionService;
import lombok.RequiredArgsConstructor;

/**
 * REST Controller quản lý Permission (phân quyền API).
 *
 * <p>Controller cung cấp CRUD permission cơ bản và truy vấn danh sách có/không phân trang.
 */
@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
public class PermissionController {
    private final PermissionService permissionService;

    /**
     * Tạo mới permission.
     *
     * @param permissionDTO payload permission
     * @return permission sau khi tạo
     */
    @PostMapping
    public ResponseEntity<ApiResponse<PermissionDTO>> createPermission(@RequestBody PermissionDTO permissionDTO) {
        return ResponseEntity.ok(ApiResponse.<PermissionDTO>builder()
                .code(200)
                .message("Permission created successfully")
                .result(permissionService.createPermission(permissionDTO))
                .build());
    }

    /**
     * Cập nhật permission theo id.
     *
     * @param id id permission
     * @param permissionDTO payload cập nhật
     * @return permission sau cập nhật
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PermissionDTO>> updatePermission(
            @PathVariable Integer id, @RequestBody PermissionDTO permissionDTO) {
        return ResponseEntity.ok(ApiResponse.<PermissionDTO>builder()
                .code(200)
                .message("Permission updated successfully")
                .result(permissionService.updatePermission(id, permissionDTO))
                .build());
    }

    /**
     * Lấy danh sách permission phân trang.
     *
     * @param page trang (0-based)
     * @param size kích thước trang
     * @return danh sách permission phân trang
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<PermissionDTO>>> getAllPermissions(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.<Page<PermissionDTO>>builder()
                .code(200)
                .result(permissionService.getAllPermissions(page, size))
                .build());
    }

    /**
     * Lấy danh sách permission không phân trang.
     *
     * @return danh sách permission
     */
    @GetMapping("/noPaging")
    public ResponseEntity<ApiResponse<List<PermissionDTO>>> getAllPermissionsNoPaging() {
        return ResponseEntity.ok(ApiResponse.<java.util.List<PermissionDTO>>builder()
                .code(200)
                .result(permissionService.getAllPermissionsNoPaging())
                .build());
    }
}
