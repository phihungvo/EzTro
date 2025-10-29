package carevn.luv2code.ez_tro.controller.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import carevn.luv2code.ez_tro.configuration.MinioService;
import carevn.luv2code.ez_tro.dto.FileDTO;
import carevn.luv2code.ez_tro.dto.UserDTO;
import carevn.luv2code.ez_tro.dto.requests.AssignRoleRequest;
import carevn.luv2code.ez_tro.dto.requests.CreateUserRequest;
import carevn.luv2code.ez_tro.dto.requests.UserUpdateRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.UserInfoDTO;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.repository.UserRepository;
import carevn.luv2code.ez_tro.service.admin.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final UserRepository userRepository;
    private final MinioService minioService;

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody CreateUserRequest request) {
        UserDTO createdUser = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @PostMapping("/assign-roles")
    public ResponseEntity<UserDTO> assignRoles(@Valid @RequestBody AssignRoleRequest request) {
        UserDTO user = userService.assignRoles(request);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Integer id, @RequestBody UserUpdateRequest request) {
        UserDTO updatedUser = userService.updateUser(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    //    @GetMapping("/getByUsername")
    //    public ApiResponse<User> getByUsername(@RequestParam String username) {
    //        return ApiResponse.<User>builder()
    //                .code(200)
    //                .result(userService.findByUsername(username))
    //                .build();
    //    }

    @GetMapping("/getAll")
    public ResponseEntity<Page<UserDTO>> findAll(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Page<UserDTO> users = userService.findAll(page, size);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/basic-info")
    public ResponseEntity<List<UserInfoDTO>> getAllUserBasicInfo() {
        List<UserInfoDTO> users = userService.getAllBasicUserInfo();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/owners")
    public ResponseEntity<List<UserInfoDTO>> getAllOwners() {
        List<UserInfoDTO> owners = userService.getAllOwners();
        return ResponseEntity.ok(owners);
    }

    @PostMapping("/upload/{userId}")
    public ApiResponse<FileDTO> uploadFile(@RequestParam("file") MultipartFile file, @PathVariable Integer userId) {
        if (file.isEmpty()) {
            return ApiResponse.<FileDTO>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("File is empty. Please upload a valid file.")
                    .result(null)
                    .build();
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User uploadedBy = userRepository
                .findByUserName(auth.getName())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        FileDTO savedFile = minioService.uploadFileForUser(file, uploadedBy, userId);
        return ApiResponse.<FileDTO>builder()
                .code(HttpStatus.OK.value())
                .message("Upload successful")
                .result(savedFile)
                .build();
    }

    //    @PostMapping("/createUser")
    //    public ResponseEntity<ApiResponse<String>> createUser(@RequestBody UserDTO userDTO) {
    //        userService.save(userDTO);
    //        return ResponseEntity.ok(ApiResponse.<String>builder()
    //                .code(200)
    //                .result("Tạo người dùng thành công")
    //                .build());
    //    }
    //
    //    @PatchMapping("/{userId}/update")
    //    public ResponseEntity<ApiResponse<String>> updateUser(
    //            @PathVariable UUID userId, @RequestBody UserUpdateRequest request) {
    //        userService.updateUser(userId, request);
    //        return ResponseEntity.ok(ApiResponse.<String>builder()
    //                .code(200)
    //                .result("Cập nhật người dùng thành công")
    //                .build());
    //    }
    //
    //    @DeleteMapping()
    //    public ResponseEntity<ApiResponse<String>> deleteUser(@RequestBody List<UUID> userIds) {
    //        userIds.forEach(userService::deleteUser);
    //
    //        return ResponseEntity.ok(ApiResponse.<String>builder()
    //                .code(200)
    //                .result("Xóa người dùng thành công")
    //                .build());
    //    }
    //
    //    @PostMapping("/assignPermissions")
    //    public ResponseEntity<ApiResponse<String>> assignPermissions(
    //            @RequestParam UUID userId, @RequestBody List<String> permissionNames) {
    //        userService.assignPermissions(userId, permissionNames);
    //        return ResponseEntity.ok(ApiResponse.<String>builder()
    //                .code(200)
    //                .result("Gán quyền thành công")
    //                .build());
    //    }
    //
    //    @DeleteMapping("/removePermission")
    //    public ResponseEntity<ApiResponse<String>> removePermission(
    //            @RequestParam UUID userId, @RequestParam String resource, @RequestParam String action) {
    //        userService.removePermission(userId, resource, action);
    //        return ResponseEntity.ok(ApiResponse.<String>builder()
    //                .code(200)
    //                .result("Xóa quyền thành công")
    //                .build());
    //    }
    //
    //    // @GetMapping("/{userId}/permissions")
    //    // public ResponseEntity<ApiResponse<List<String>>> getUserPermissions(@PathVariable UUID userId) {
    //    //        List<String> permissions = userService.getUserPermissions(userId);
    //    //        return ResponseEntity.ok(ApiResponse.<List<String>>builder()
    //    //                .code(200)
    //    //                .result(permissions)
    //    //                .build());
    //    //    }
    //
    //    @GetMapping("/permissions")
    //    public ResponseEntity<ApiResponse<List<Permission>>> getAllPermissions() {
    //        List<Permission> permissions = userService.getAllPermissions();
    //        return ResponseEntity.ok(ApiResponse.<List<Permission>>builder()
    //                .code(200)
    //                .result(permissions)
    //                .build());
    //    }
}
