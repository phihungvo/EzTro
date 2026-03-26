package carevn.luv2code.ez_tro.controller.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.RoleDTO;
import carevn.luv2code.ez_tro.dto.requests.AssignPermissionRequest;
import carevn.luv2code.ez_tro.dto.requests.CreateRoleRequest;
import carevn.luv2code.ez_tro.dto.requests.UpdateRoleRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.service.admin.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST Controller quản lý Role và gán Permission cho Role.
 *
 * <p>Controller cung cấp:
 * <ul>
 *   <li>Tạo role, cập nhật role.</li>
 *   <li>Gán permissions cho role.</li>
 *   <li>Lấy danh sách role (có/không phân trang).</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {
    private final RoleService roleService;

    /**
     * Tạo mới role.
     *
     * @param request payload tạo role
     * @return role vừa tạo
     */
    @PostMapping
    public ResponseEntity<RoleDTO> createRole(@Valid @RequestBody CreateRoleRequest request) {
        RoleDTO createdRole = roleService.createRole(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRole);
    }

    /**
     * Gán danh sách permission cho role.
     *
     * @param request payload gán permission
     * @return role sau khi gán
     */
    @PostMapping("/assign-permissions")
    public ResponseEntity<RoleDTO> assignPermissions(@Valid @RequestBody AssignPermissionRequest request) {
        RoleDTO role = roleService.assignPermissions(request);
        return ResponseEntity.ok(role);
    }

    /**
     * Cập nhật role theo id.
     *
     * @param id id role
     * @param request payload cập nhật
     * @return response chứa role sau cập nhật
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RoleDTO>> updateRole(
            @PathVariable Integer id, @RequestBody UpdateRoleRequest request) {
        RoleDTO updated = roleService.updateRole(id, request);
        return ResponseEntity.ok(ApiResponse.<RoleDTO>builder()
                .code(200)
                .message("Role updated successfully")
                .result(updated)
                .build());
    }

    /**
     * Lấy danh sách role phân trang.
     *
     * @param page trang (0-based)
     * @param size kích thước trang
     * @return danh sách role phân trang
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<RoleDTO>>> getAllRoles(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.<Page<RoleDTO>>builder()
                .code(200)
                .result(roleService.getAllRoles(page, size))
                .build());
    }

    /**
     * Lấy danh sách role không phân trang.
     *
     * @return danh sách role
     */
    @GetMapping("/noPaging")
    public ResponseEntity<ApiResponse<List<RoleDTO>>> getAllRolesNoPaging() {
        return ResponseEntity.ok(ApiResponse.<List<RoleDTO>>builder()
                .code(200)
                .result(roleService.getAllRolesNoPaging())
                .build());
    }
    //
    //    @PostMapping("/{roleId}/permissions")
    //    @PreAuthorize("hasAuthority('ROLE:UPDATE')")
    //    public ResponseEntity<ApiResponse<Void>> assignPermissionsToRole(
    //            @PathVariable UUID roleId, @RequestBody List<UUID> permissionIds) {
    //        roleService.assignPermissionsToRole(roleId, permissionIds);
    //        return ResponseEntity.ok(ApiResponse.<Void>builder()
    //                .code(200)
    //                .message("Permissions assigned successfully")
    //                .build());
    //    }
    //
    //    @DeleteMapping("/{roleId}/permissions/{permissionId}")
    //    @PreAuthorize("hasAuthority('ROLE:UPDATE')")
    //    public ResponseEntity<ApiResponse<Void>> removePermissionFromRole(
    //            @PathVariable UUID roleId, @PathVariable UUID permissionId) {
    //        roleService.removePermissionFromRole(roleId, permissionId);
    //        return ResponseEntity.ok(ApiResponse.<Void>builder()
    //                .code(200)
    //                .message("Permission removed successfully")
    //                .build());
    //    }
    //
    //    @DeleteMapping("/{id}")
    //    //    @PreAuthorize("hasAuthority('ROLE:DELETE')")
    //    public ResponseEntity<ApiResponse<Void>> deleteRole(@PathVariable UUID id) {
    //        roleService.deleteRole(id);
    //        return ResponseEntity.ok(ApiResponse.<Void>builder()
    //                .code(200)
    //                .message("Role deleted successfully")
    //                .build());
    //    }
}
