package carevn.luv2code.ez_tro.service.admin.impl;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import carevn.luv2code.ez_tro.dto.PermissionDTO;
import carevn.luv2code.ez_tro.dto.requests.CreatePermissionRequest;
import carevn.luv2code.ez_tro.entity.Permission;
import carevn.luv2code.ez_tro.enums.HttpMethod;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.PermissionMapper;
import carevn.luv2code.ez_tro.repository.PermissionRepository;
import carevn.luv2code.ez_tro.service.admin.PermissionService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service quản lý Permission (phân quyền API).
 *
 * <p>Permission có thể được gán cho Role và/hoặc truy vấn theo user để phục vụ kiểm tra quyền.
 * Một số method có cache để tối ưu truy vấn permission.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PermissionServiceImpl implements PermissionService {
    private final PermissionRepository permissionRepository;
    private final PermissionMapper permissionMapper;

    /**
     * Tạo mới permission từ DTO.
     *
     * @param permissionDTO DTO permission
     * @return permission DTO sau khi tạo
     */
    @Override
    @Transactional
    public PermissionDTO createPermission(PermissionDTO permissionDTO) {
        if (permissionRepository.existsByName(permissionDTO.getName())) {
            throw new AppException(ErrorCode.PERMISSION_ALREADY_EXISTS);
        }
        Permission permission = permissionMapper.toEntity(permissionDTO);

        Permission savedPermission = permissionRepository.save(permission);
        return permissionMapper.toDTO(savedPermission);
    }

    //    @Override
    //    public Permission createPermission(String name, String description, String apiEndpoint, HttpMethod httpMethod)
    // {
    //        Permission permission = new Permission();
    //        permission.setName(name);
    //        permission.setDescription(description);
    //        permission.setApiEndpoint(apiEndpoint);
    //        permission.setHttpMethod(httpMethod);
    //        return permissionRepository.save(permission);
    //    }

    /**
     * Cập nhật permission theo id.
     *
     * @param id id permission
     * @param permissionDTO DTO cập nhật
     * @return permission DTO sau cập nhật
     */
    @Override
    @Transactional
    public PermissionDTO updatePermission(Integer id, PermissionDTO permissionDTO) {
        Permission permission =
                permissionRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND));

        //        permissionRepository
        //                .findByApiEndpointAndHttpMethod(permissionDTO.getApiEndpoint(),
        // permissionDTO.getHttpMethod());

        permission.setName(permissionDTO.getName());
        permission.setDescription(permissionDTO.getDescription());
        permission.setApiEndpoint(permissionDTO.getApiEndpoint());
        permission.setHttpMethod(permissionDTO.getHttpMethod());
        permission.setResourcePattern(permissionDTO.getResourcePattern());

        Permission updatedPermission = permissionRepository.save(permission);

        return permissionMapper.toDTO(updatedPermission);
    }

    //    @Override
    //    @Transactional
    //    public void deletePermission(UUID id) {
    //        Permission permission =
    //                permissionRepository.findById(id).orElseThrow(() -> new
    // AppException(ErrorCode.PERMISSION_NOT_FOUND));
    //
    //        // Remove permission from all roles first
    //        permission.getRoles().forEach(role -> {
    //            role.getPermissions().remove(permission);
    //        });
    //
    //        // Remove permission from all users that have it directly
    //        //        permission.getUsers().forEach(user -> {
    //        //            user.getPermissions().remove(permission);
    //        //        });
    //
    //        permissionRepository.delete(permission);
    //    }

    //    @Override
    //    public PermissionDTO getPermission(UUID id) {
    //        Permission permission =
    //                permissionRepository.findById(id).orElseThrow(() -> new
    // AppException(ErrorCode.PERMISSION_NOT_FOUND));
    //        return convertToDTO(permission);
    //    }
    @Override
    public Page<PermissionDTO> getAllPermissions(int page, int size) {
        return permissionRepository.findAll(PageRequest.of(page, size)).map(this::convertToDTO);
    }

    //
    //        @Override
    //        public List<Permission> getAllPermissions() {
    //            return permissionRepository.findAll();
    //        }
    //
    //    @Override
    //    public Permission getPermissionById(Integer id) {
    //        return permissionRepository.findById(id)
    //                .orElseThrow(() -> new RuntimeException("Permission not found"));
    //    }
    //
    //    @Override
    //    public void deletePermission(Integer id) {
    //        permissionRepository.deleteById(id);
    //    }
    //
    @Override
    public List<PermissionDTO> getAllPermissionsNoPaging() {
        List<Permission> permissions = permissionRepository.findAll();
        return permissions.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    /**
     * Tạo permission từ request (dùng cho một số flow khác) và evict cache.
     *
     * @param request payload tạo permission
     * @return permission DTO sau khi tạo
     */
    @CacheEvict(
            value = {"userPermissions", "rolePermissions"},
            allEntries = true)
    public PermissionDTO createPermission(CreatePermissionRequest request) {
        if (permissionRepository.existsByName(request.getName())) {
            throw new RuntimeException("Permission name already exists");
        }

        Permission permission = new Permission();
        permission.setName(request.getName());
        permission.setDescription(request.getDescription());
        permission.setApiEndpoint(request.getApiEndpoint());
        permission.setHttpMethod(request.getHttpMethod());
        permission.setResourcePattern(request.getResourcePattern());

        Permission savedPermission = permissionRepository.save(permission);
        return permissionMapper.toDTO(savedPermission);
    }

    /**
     * Lấy danh sách permission của user theo username (có cache).
     *
     * @param username username
     * @return danh sách permission entity
     */
    @Override
    @Cacheable(value = "userPermissions", key = "#username")
    public List<Permission> getUserPermissions(String username) {
        Set<Permission> permissions = permissionRepository.findPermissionsByUsername(username);
        return permissions.stream().toList();
    }

    /**
     * Kiểm tra user có permission cho endpoint + http method hay không.
     *
     * @param username username
     * @param endpoint endpoint đang check
     * @param method http method (string)
     * @return true nếu có quyền
     */
    @Override
    public boolean hasPermissionForEndpoint(String username, String endpoint, String method) {
        try {
            HttpMethod httpMethod = HttpMethod.valueOf(method.toUpperCase());
            List<Permission> permissions =
                    permissionRepository.findUserPermissionsForEndpoint(username, endpoint, endpoint, httpMethod);
            return !permissions.isEmpty();
        } catch (Exception e) {
            log.error("Error checking permission for user {} on {} {}", username, method, endpoint, e);
            return false;
        }
    }

    private PermissionDTO convertToDTO(Permission permission) {
        PermissionDTO dto = new PermissionDTO();
        dto.setName(permission.getName());
        dto.setId(permission.getId());
        dto.setApiEndpoint(permission.getApiEndpoint());
        dto.setResourcePattern(permission.getResourcePattern());
        dto.setHttpMethod(permission.getHttpMethod());
        dto.setDescription(permission.getDescription());

        return dto;
    }
}
