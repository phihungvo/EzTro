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

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {
    private final RoleService roleService;

    @PostMapping
    public ResponseEntity<RoleDTO> createRole(@Valid @RequestBody CreateRoleRequest request) {
        RoleDTO createdRole = roleService.createRole(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRole);
    }

    @PostMapping("/assign-permissions")
    public ResponseEntity<RoleDTO> assignPermissions(@Valid @RequestBody AssignPermissionRequest request) {
        RoleDTO role = roleService.assignPermissions(request);
        return ResponseEntity.ok(role);
    }

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

    @GetMapping
    public ResponseEntity<ApiResponse<Page<RoleDTO>>> getAllRoles(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.<Page<RoleDTO>>builder()
                .code(200)
                .result(roleService.getAllRoles(page, size))
                .build());
    }

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
