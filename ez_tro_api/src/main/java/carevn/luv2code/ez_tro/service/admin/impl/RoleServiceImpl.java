package carevn.luv2code.ez_tro.service.admin.impl;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import carevn.luv2code.ez_tro.dto.PermissionDTO;
import carevn.luv2code.ez_tro.dto.RoleDTO;
import carevn.luv2code.ez_tro.dto.requests.AssignPermissionRequest;
import carevn.luv2code.ez_tro.dto.requests.CreateRoleRequest;
import carevn.luv2code.ez_tro.dto.requests.UpdateRoleRequest;
import carevn.luv2code.ez_tro.entity.Permission;
import carevn.luv2code.ez_tro.entity.Role;
import carevn.luv2code.ez_tro.mapper.RoleMapper;
import carevn.luv2code.ez_tro.repository.PermissionRepository;
import carevn.luv2code.ez_tro.repository.RoleRepository;
import carevn.luv2code.ez_tro.repository.UserRepository;
import carevn.luv2code.ez_tro.service.admin.RoleService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RoleMapper roleMapper;

    @CacheEvict(
            value = {"userPermissions", "rolePermissions"},
            allEntries = true)
    public RoleDTO createRole(CreateRoleRequest request) {
        if (roleRepository.existsByName(request.getName())) {
            throw new RuntimeException("Role name already exists");
        }

        Role role = new Role();
        role.setName(request.getName().toUpperCase());
        role.setDescription(request.getDescription());

        // Assign permissions
        if (request.getPermissionIds() != null && !request.getPermissionIds().isEmpty()) {
            Set<Permission> permissions = new HashSet<>();
            for (Integer permissionId : request.getPermissionIds()) {
                Permission permission = permissionRepository
                        .findById(permissionId)
                        .orElseThrow(() -> new RuntimeException("Permission not found: " + permissionId));
                permissions.add(permission);
            }
            role.setPermissions(permissions);
        }

        Role savedRole = roleRepository.save(role);
        return roleMapper.toDTO(savedRole);
    }

    @CacheEvict(
            value = {"userPermissions", "rolePermissions"},
            allEntries = true)
    public RoleDTO assignPermissions(AssignPermissionRequest request) {
        Role role =
                roleRepository.findById(request.getRoleId()).orElseThrow(() -> new RuntimeException("Role not found"));

        Set<Permission> permissions = new HashSet<>();
        for (Integer permissionId : request.getPermissionIds()) {
            Permission permission = permissionRepository
                    .findById(permissionId)
                    .orElseThrow(() -> new RuntimeException("Permission not found: " + permissionId));
            permissions.add(permission);
        }

        role.setPermissions(permissions);
        Role updatedRole = roleRepository.save(role);
        return roleMapper.toDTO(updatedRole);
    }

    @CacheEvict(
            value = {"userPermissions", "rolePermissions"},
            allEntries = true)
    public RoleDTO updateRole(Integer id, UpdateRoleRequest request) {
        Role role = roleRepository.findById(id).orElseThrow(() -> new RuntimeException("Role not found"));

        role.setName(request.getName().toUpperCase());

        if (request.getDescription() != null) {
            role.setDescription(request.getDescription());
        }

        // Update permissions
        if (request.getPermissionIds() != null) {
            Set<Permission> permissions = new HashSet<>();
            for (Integer permissionId : request.getPermissionIds()) {
                Permission permission = permissionRepository
                        .findById(permissionId)
                        .orElseThrow(() -> new RuntimeException("Permission not found: " + permissionId));
                permissions.add(permission);
            }
            role.setPermissions(permissions);
        }

        Role updatedRole = roleRepository.save(role);
        return roleMapper.toDTO(updatedRole);
    }

    //    @Override
    //    @Transactional
    //    public RoleDTO createRole(RoleDTO roleDTO) {
    //        if (roleRepository.existsByName(roleDTO.getName())) {
    //            throw new AppException(ErrorCode.ROLE_ALREADY_EXISTS);
    //        }
    //
    //        Role role = new Role();
    //        role.setName(roleDTO.getName());
    //        role.setDescription(roleDTO.getDescription());
    //
    //        //        if (roleDTO.getPermissions() != null) {
    //        //            role.setPermissions(convertToPermissionSet(roleDTO.getPermissions()));
    //        //        }
    //
    //        Role savedRole = roleRepository.save(role);
    //        return convertToDTO(savedRole);
    //    }

    //    @Override
    //    @Transactional
    //    public RoleDTO updateRole(UUID id, RoleDTO roleDTO) {
    //        Role role = roleRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
    //
    //        // Check if new name already exists for different role
    //        if (!role.getName().equals(roleDTO.getName()) && roleRepository.existsByName(roleDTO.getName())) {
    //            throw new AppException(ErrorCode.ROLE_ALREADY_EXISTS);
    //        }
    //
    //        role.setName(roleDTO.getName());
    //        role.setDescription(roleDTO.getDescription());
    //        //        if (roleDTO.getPermissions() != null) {
    //        //            role.setPermissions(convertToPermissionSet(roleDTO.getPermissions()));
    //        //        }
    //
    //        Role updatedRole = roleRepository.save(role);
    //        return convertToDTO(updatedRole);
    //    }
    //
    //    @Override
    //    @Transactional
    //    public void deleteRole(UUID id) {
    //        //        Role role = roleRepository.findById(id)
    //        //                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
    //        //
    //        //        // Gỡ role khỏi tất cả user
    //        //        for (User user : role.getUsers()) {
    //        //            user.getRoles().remove(role);
    //        //        }
    //        //
    //        //        // Gỡ permission khỏi role
    //        //        for (Permission permission : role.getPermissions()) {
    //        //            permission.getRoles().remove(role);
    //        //        }
    //        //
    //        //        // Xóa toàn bộ liên kết trong tập của role
    //        //        role.getUsers().clear();
    //        //        role.getPermissions().clear();
    //        //
    //        //        // Lưu thay đổi để xóa dữ liệu ở bảng trung gian trước khi xóa role
    //        //        roleRepository.save(role);
    //        //
    //        //        // Cuối cùng xóa role
    //        //        roleRepository.delete(role);
    //        roleRepository.deleteById(id);
    //    }
    //
    //    @Override
    //    public RoleDTO getRole(UUID id) {
    //        Role role = roleRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
    //        return convertToDTO(role);
    //    }
    //
    @Override
    public Page<RoleDTO> getAllRoles(int page, int size) {
        return roleRepository.findAll(PageRequest.of(page, size)).map(this::convertToDTO);
    }

    @Override
    public List<RoleDTO> getAllRolesNoPaging() {
        List<Role> roles = roleRepository.findAll();
        return roles.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    //
    //    @Override
    //    @Transactional
    //    public void assignPermissionsToRole(UUID roleId, List<UUID> permissionIds) {
    //        Role role = roleRepository.findById(roleId).orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
    //
    //        Set<Permission> permissions = permissionIds.stream()
    //                .map(id -> permissionRepository
    //                        .findById(id)
    //                        .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND)))
    //                .collect(Collectors.toSet());
    //
    //        role.getPermissions().addAll(permissions);
    //        roleRepository.save(role);
    //    }
    //
    //    @Override
    //    @Transactional
    //    public void removePermissionFromRole(UUID roleId, UUID permissionId) {
    //        Role role = roleRepository.findById(roleId).orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
    //
    //        Permission permission = permissionRepository
    //                .findById(permissionId)
    //                .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND));
    //
    //        role.getPermissions().remove(permission);
    //        roleRepository.save(role);
    //    }
    //
    //        private Set<Permission> convertToPermissionSet(Set<UUID> permissionIds) {
    //            if (permissionIds == null) return Collections.emptySet();
    //
    //            return permissionIds.stream()
    //                    .map(id -> permissionRepository
    //                            .findById(id)
    //                            .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND)))
    //                    .collect(Collectors.toSet());
    //        }

    private PermissionDTO convertToPermissionDTO(Permission permission) {
        PermissionDTO dto = new PermissionDTO();
        dto.setId(permission.getId());
        dto.setName(permission.getName());
        dto.setDescription(permission.getDescription());
        return dto;
    }
    //
    private RoleDTO convertToDTO(Role role) {
        RoleDTO dto = new RoleDTO();
        dto.setId(role.getId());
        dto.setName(role.getName());
        dto.setDescription(role.getDescription());

        if (role.getPermissions() != null) {
            Set<PermissionDTO> permissionDTOs = role.getPermissions().stream()
                    .map(this::convertToPermissionDTO)
                    .collect(Collectors.toSet());
            dto.setPermissions(permissionDTOs);
        }

        return dto;
    }
}
