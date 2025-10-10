package carevn.luv2code.ez_tro.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.PermissionDTO;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.service.PermissionService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
public class PermissionController {
    private final PermissionService permissionService;

    @PostMapping
    public ResponseEntity<ApiResponse<PermissionDTO>> createPermission(@RequestBody PermissionDTO permissionDTO) {
        return ResponseEntity.ok(ApiResponse.<PermissionDTO>builder()
                .code(200)
                .message("Permission created successfully")
                .result(permissionService.createPermission(permissionDTO))
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PermissionDTO>> updatePermission(
            @PathVariable Integer id, @RequestBody PermissionDTO permissionDTO) {
        return ResponseEntity.ok(ApiResponse.<PermissionDTO>builder()
                .code(200)
                .message("Permission updated successfully")
                .result(permissionService.updatePermission(id, permissionDTO))
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PermissionDTO>>> getAllPermissions(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.<Page<PermissionDTO>>builder()
                .code(200)
                .result(permissionService.getAllPermissions(page, size))
                .build());
    }

    @GetMapping("/noPaging")
    public ResponseEntity<ApiResponse<List<PermissionDTO>>> getAllPermissionsNoPaging() {
        return ResponseEntity.ok(ApiResponse.<java.util.List<PermissionDTO>>builder()
                .code(200)
                .result(permissionService.getAllPermissionsNoPaging())
                .build());
    }
}
