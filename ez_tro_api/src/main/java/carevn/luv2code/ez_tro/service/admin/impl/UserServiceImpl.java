package carevn.luv2code.ez_tro.service.admin.impl;

import java.util.*;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.UserDTO;
import carevn.luv2code.ez_tro.dto.requests.AssignRoleRequest;
import carevn.luv2code.ez_tro.dto.requests.CreateUserRequest;
import carevn.luv2code.ez_tro.dto.requests.UserUpdateRequest;
import carevn.luv2code.ez_tro.dto.response.UserInfoDTO;
import carevn.luv2code.ez_tro.entity.Role;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.UserMapper;
import carevn.luv2code.ez_tro.repository.PermissionRepository;
import carevn.luv2code.ez_tro.repository.RoleRepository;
import carevn.luv2code.ez_tro.repository.UserRepository;
import carevn.luv2code.ez_tro.service.admin.SystemConfigService;
import carevn.luv2code.ez_tro.service.admin.UserService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

/**
 * Service quản lý User (tài khoản) phía admin.
 *
 * <p>Service hỗ trợ tạo/cập nhật user, gán roles và truy vấn danh sách.
 * Khi tạo user có role OWNER, service sẽ ensure subscription mặc định thông qua {@link SystemConfigService}.
 */
@Service
@Transactional
public class UserServiceImpl implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    private final PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final SystemConfigService systemConfigService;

    public UserServiceImpl(
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            PermissionRepository permissionRepository,
            RoleRepository roleRepository,
            UserMapper userMapper,
            SystemConfigService systemConfigService) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userMapper = userMapper;
        this.systemConfigService = systemConfigService;
    }

    //    @Override
    //    public User findByUsername(String username) {
    //        return userRepository.findByUserName(username).orElseThrow(() -> new
    // AppException(ErrorCode.USER_NOT_FOUND));
    //    }

    //    @Override
    //    public void save(UserDTO userDTO) {
    //        if (userRepository.existsByEmail(userDTO.getEmail())) {
    //            throw new AppException(ErrorCode.EMAIL_EXISTED);
    //        }
    //        User user = userMapper.toEntity(userDTO);
    //
    //        user.setPassword(passwordEncoder.encode(user.getPassword()));
    //        user.setCreateAt(new Date());
    //        //        user.setRoles(convertToRoleSet(userDTO.getRoles()));
    //        //        user.setPermissions(convertToPermissionSet(userDTO.getPermissions()));
    //
    //        userRepository.save(user);
    //    }

    /**
     * Tạo mới user.
     *
     * @param request payload tạo user
     * @return user DTO sau khi tạo
     */
    @CacheEvict(value = "userPermissions", key = "#request.userName")
    public UserDTO createUser(CreateUserRequest request) {
        if (userRepository.existsByUserName(request.getUserName())) {
            throw new AppException(ErrorCode.USERNAME_EXISTED);
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }

        User user = userMapper.toEntity(request);

        user.setPassword(passwordEncoder.encode(request.getPassword()));

        if (request.getRoleIds() != null && !request.getRoleIds().isEmpty()) {
            Set<Role> roles = new HashSet<>();
            for (Integer roleId : request.getRoleIds()) {
                Role role = roleRepository
                        .findById(roleId)
                        .orElseThrow(() -> new RuntimeException("Role not found: " + roleId));
                roles.add(role);
            }
            user.setRoles(roles);
        }

        User savedUser = userRepository.save(user);
        systemConfigService.ensureDefaultSubscriptionForOwner(savedUser);

        UserDTO dto = userMapper.toDTO(savedUser);

        if (savedUser.getRoles() != null) {
            Set<Integer> roleIds =
                    savedUser.getRoles().stream().map(Role::getId).collect(Collectors.toSet());

            Set<String> roleNames =
                    savedUser.getRoles().stream().map(Role::getName).collect(Collectors.toSet());

            dto.setRoleIds(roleIds);
            dto.setRoleNames(roleNames);
        }

        return dto;
    }

    /**
     * Gán roles cho user (thay thế toàn bộ set roles).
     *
     * @param request payload gán role
     * @return user DTO sau khi gán
     */
    @CacheEvict(value = "userPermissions", key = "#request.userId")
    public UserDTO assignRoles(AssignRoleRequest request) {
        User user =
                userRepository.findById(request.getUserId()).orElseThrow(() -> new RuntimeException("User not found"));

        Set<Role> roles = new HashSet<>();
        for (Integer roleId : request.getRoleIds()) {
            Role role = roleRepository
                    .findById(roleId)
                    .orElseThrow(() -> new RuntimeException("Role not found: " + roleId));
            roles.add(role);
        }

        user.setRoles(roles);
        User updatedUser = userRepository.save(user);
        return userMapper.toDTO(updatedUser);
    }

    /**
     * Cập nhật user theo id (bao gồm roles nếu có).
     *
     * @param id id user
     * @param request payload cập nhật
     * @return user DTO sau khi cập nhật
     */
    @CacheEvict(value = "userPermissions", allEntries = true)
    public UserDTO updateUser(Integer id, UserUpdateRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

        userMapper.updateUserFromDto(request, user);

        // update roles nếu có
        if (request.getRoleIds() != null) {
            Set<Role> roles = request.getRoleIds().stream()
                    .map(roleId -> roleRepository
                            .findById(roleId)
                            .orElseThrow(() -> new RuntimeException("Role not found: " + roleId)))
                    .collect(Collectors.toSet());
            user.setRoles(roles);
        }

        User savedUser = userRepository.save(user);
        return userMapper.toDTO(savedUser);
    }

    //    @Override
    //    public void updateUser(UUID userId, UserUpdateRequest request) {
    //        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    //
    //        userMapper.updateUserFromDto(request, user);
    //        user.setUpdateAt(new Date());
    //
    //        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
    //            user.setPassword(passwordEncoder.encode(request.getPassword()));
    //        }
    //
    //        user.setRoles(convertToRoleSet(request.getRoles()));
    //        user.setPermissions(convertToPermissionSet(request.getPermissions()));
    //        user.setEnabled(request.isEnabled());
    //
    //        userRepository.save(user);
    //    }

    @Override
    public Page<UserDTO> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return userRepository.findAll(pageable).map(this::convertToDTO);
    }

    /**
     * Lấy danh sách owners (basic info).
     *
     * @return danh sách owner basic info DTO
     */
    @Override
    public List<UserInfoDTO> getAllOwners() {
        List<User> owners = userRepository.findAllOwners();
        return owners.stream().map(userMapper::toBasicInfoDTO).toList();
    }

    /**
     * Lấy danh sách basic info của tất cả user.
     *
     * @return danh sách user basic info DTO
     */
    @Override
    public List<UserInfoDTO> getAllBasicUserInfo() {
        List<User> users = userRepository.findAll();
        return users.stream().map(userMapper::toBasicInfoDTO).toList();
    }

    //    @Override
    //    public void deleteUser(UUID userId) {
    //        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    //        userRepository.delete(user);
    //    }

    //    @Override
    //    @Transactional
    //    public void assignPermissions(UUID userId, List<String> permissionNames) {
    //        User user = userRepository.findById(userId)
    //                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    //
    //        // Khóa người dùng bằng Pessimistic Locking
    //        entityManager.lock(user, LockModeType.PESSIMISTIC_WRITE);
    //
    //        Set<Permission> permissions = convertToPermissionSet(permissionNames);
    //        user.getPermissions().addAll(permissions);
    //        userRepository.save(user);
    //        log.info("Đã gán quyền cho người dùng ID: {}", userId);
    //    }

    //    @Override
    //    @Transactional
    //    public void removePermission(UUID userId, String resource, String action) {
    //        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    //
    //        // Khóa người dùng bằng Pessimistic Locking
    //        entityManager.lock(user, LockModeType.PESSIMISTIC_WRITE);
    //
    //        //        Permission permission = permissionRepository.findByResourceAndAction(resource, action)
    //        //                .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND));
    //        //        user.getPermissions().remove(permission);
    //        userRepository.save(user);
    //        log.info("Đã xóa quyền {}:{} khỏi người dùng ID: {}", resource, action, userId);
    //    }

    //    @Override
    //    public List<String> getUserPermissions(UUID userId) {
    //        User user = userRepository.findById(userId)
    //                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    //
    //        // Get direct permissions
    ////        Set<Permission> allPermissions = new HashSet<>(user.getPermissions());
    //
    //        // Add permissions from roles

    /// /        user.getRoles().forEach(role -> {
    /// /            allPermissions.addAll(role.getPermissions());
    /// /        });
    /// /
    /// /        return allPermissions.stream()
    /// /                .map(p -> p.getResource() + ":" + p.getAction())
    /// /                .collect(Collectors.toList());
    //    }

    //    @Override
    //    public List<Permission> getAllPermissions() {
    //        return permissionRepository.findAll();
    //    }
    //
    //    private Set<Role> convertToRoleSet(List<UUID> roleIds) {
    //        if (roleIds == null) return Collections.emptySet();
    //
    //        return roleIds.stream()
    //                .map(id -> roleRepository.findById(id).orElseThrow(() -> new
    // AppException(ErrorCode.ROLE_NOT_FOUND)))
    //                .collect(Collectors.toSet());
    //    }

    //    private Set<Permission> convertToPermissionSet(List<UUID> permissionIds) {
    //        if (permissionIds == null) return Collections.emptySet();
    //
    //        return permissionIds.stream()
    //                .map(id -> permissionRepository
    //                        .findById(id)
    //                        .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND)))
    //                .collect(Collectors.toSet());
    //    }
    //
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUserName(user.getUsername());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setAddress(user.getAddress());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setOriginalPassword(user.getOriginalPassword());
        dto.setEnabled(user.isEnabled());

        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            Set<Integer> roleIds = user.getRoles().stream().map(Role::getId).collect(Collectors.toSet());

            Set<String> roleNames = user.getRoles().stream()
                    .map(Role::getName)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            dto.setRoleIds(roleIds);
            dto.setRoleNames(roleNames);
        }

        return dto;
    }
}
