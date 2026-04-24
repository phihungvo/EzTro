package carevn.luv2code.ez_tro.configuration;

import java.util.Date;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.configuration.seed.RbacSeedData;
import carevn.luv2code.ez_tro.configuration.seed.RbacSeedDataLoader;
import carevn.luv2code.ez_tro.configuration.seed.SeedProperties;
import carevn.luv2code.ez_tro.configuration.seed.SubscriptionPlanSeedData;
import carevn.luv2code.ez_tro.configuration.seed.SubscriptionPlanSeedDataLoader;
import carevn.luv2code.ez_tro.entity.Permission;
import carevn.luv2code.ez_tro.entity.Role;
import carevn.luv2code.ez_tro.entity.SubscriptionPlan;
import carevn.luv2code.ez_tro.entity.SystemConfig;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.repository.PermissionRepository;
import carevn.luv2code.ez_tro.repository.RoleRepository;
import carevn.luv2code.ez_tro.repository.SubscriptionPlanRepository;
import carevn.luv2code.ez_tro.repository.SystemConfigRepository;
import carevn.luv2code.ez_tro.repository.UserRepository;
import carevn.luv2code.ez_tro.service.admin.SystemConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final SystemConfigRepository systemConfigRepository;
    private final SeedProperties seedProperties;
    private final RbacSeedDataLoader rbacSeedDataLoader;
    private final SubscriptionPlanSeedDataLoader subscriptionPlanSeedDataLoader;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    /**
     * Chạy seed bootstrap khi ứng dụng khởi động.
     */
    @Override
    @Transactional
    public void run(String... args) {
        if (!seedProperties.isEnabled()) {
            log.info("Seed dữ liệu mặc định đang tắt qua cấu hình `app.seed.enabled=false`.");
            return;
        }

        log.info(
                "Bắt đầu seed dữ liệu mặc định từ nguồn RBAC `{}` và plan `{}`...",
                seedProperties.getRbacResource(),
                seedProperties.getSubscriptionPlansResource());

        RbacSeedData seedData = rbacSeedDataLoader.load();
        Map<String, Role> rolesByName = seedRoles(seedData.getRoles());
        Map<String, Permission> permissionsByKey = seedPermissions(seedData.getPermissions());
        Map<String, SubscriptionPlan> plansByCode =
                seedSubscriptionPlans(subscriptionPlanSeedDataLoader.load().getPlans());

        assignPermissionsToRoles(rolesByName, permissionsByKey, seedData.getRolePermissions());
        seedDefaultPlanConfig(plansByCode);
        seedAdminUser(rolesByName.get(seedProperties.getAdmin().getRoleName()));

        log.info("Seed dữ liệu mặc định hoàn tất.");
    }

    /**
     * Seed hoặc cập nhật các role từ file seed.
     */
    private Map<String, Role> seedRoles(List<RbacSeedData.RoleSeed> roleSeeds) {
        Map<String, Role> rolesByName = new LinkedHashMap<>();
        for (RbacSeedData.RoleSeed roleSeed : roleSeeds) {
            Role role = roleRepository
                    .findByName(roleSeed.getName())
                    .map(existingRole -> {
                        if (!Objects.equals(existingRole.getDescription(), roleSeed.getDescription())) {
                            existingRole.setDescription(roleSeed.getDescription());
                            Role updatedRole = roleRepository.save(existingRole);
                            log.info("Đã cập nhật description cho role '{}'.", roleSeed.getName());
                            return updatedRole;
                        }
                        log.info("Role '{}' đã tồn tại, bỏ qua tạo mới.", roleSeed.getName());
                        return existingRole;
                    })
                    .orElseGet(() -> {
                        Role newRole = Role.builder()
                                .name(roleSeed.getName())
                                .description(roleSeed.getDescription())
                                .build();
                        Role savedRole = roleRepository.save(newRole);
                        log.info("Đã tạo role '{}'.", roleSeed.getName());
                        return savedRole;
                    });
            rolesByName.put(role.getName(), role);
        }
        return rolesByName;
    }

    /**
     * Seed hoặc cập nhật các permission từ file seed.
     */
    private Map<String, Permission> seedPermissions(List<RbacSeedData.PermissionSeed> permissionSeeds) {
        Map<String, Permission> permissionsByKey = new LinkedHashMap<>();
        for (RbacSeedData.PermissionSeed permissionSeed : permissionSeeds) {
            List<Permission> matchedPermissions = permissionRepository.findBySeedSignature(
                    permissionSeed.getName(),
                    permissionSeed.getApiEndpoint(),
                    permissionSeed.getHttpMethod(),
                    permissionSeed.getResourcePattern());

            if (matchedPermissions.size() > 1) {
                log.warn(
                        "Permission key='{}' có {} bản ghi trùng theo signature. Seeder sẽ dùng bản ghi id={} và không tạo thêm.",
                        permissionSeed.getKey(),
                        matchedPermissions.size(),
                        matchedPermissions.getFirst().getId());
            }

            Permission permission = matchedPermissions.stream()
                    .findFirst()
                    .map(existingPermission -> {
                        if (!Objects.equals(existingPermission.getDescription(), permissionSeed.getDescription())) {
                            existingPermission.setDescription(permissionSeed.getDescription());
                            Permission updatedPermission = permissionRepository.save(existingPermission);
                            log.info(
                                    "Đã cập nhật description cho permission key='{}' ({})",
                                    permissionSeed.getKey(),
                                    permissionSeed.getName());
                            return updatedPermission;
                        }
                        log.info(
                                "Permission key='{}' ({}) đã tồn tại, bỏ qua tạo mới.",
                                permissionSeed.getKey(),
                                permissionSeed.getName());
                        return existingPermission;
                    })
                    .orElseGet(() -> {
                        Permission newPermission = Permission.builder()
                                .name(permissionSeed.getName())
                                .description(permissionSeed.getDescription())
                                .apiEndpoint(permissionSeed.getApiEndpoint())
                                .httpMethod(permissionSeed.getHttpMethod())
                                .resourcePattern(permissionSeed.getResourcePattern())
                                .build();
                        Permission savedPermission = permissionRepository.save(newPermission);
                        log.info("Đã tạo permission key='{}' ({})", permissionSeed.getKey(), permissionSeed.getName());
                        return savedPermission;
                    });

            permissionsByKey.put(permissionSeed.getKey(), permission);
        }
        return permissionsByKey;
    }

    /**
     * Gán các permission còn thiếu vào từng role theo mapping seed.
     */
    private void assignPermissionsToRoles(
            Map<String, Role> rolesByName,
            Map<String, Permission> permissionsByKey,
            List<RbacSeedData.RolePermissionSeed> rolePermissionSeeds) {
        for (RbacSeedData.RolePermissionSeed rolePermissionSeed : rolePermissionSeeds) {
            Role role = rolesByName.get(rolePermissionSeed.getRoleName());
            if (role == null) {
                log.warn("Không tìm thấy role '{}' trong seed để gán permission.", rolePermissionSeed.getRoleName());
                continue;
            }

            Role managedRole =
                    roleRepository.findByNameWithPermissions(role.getName()).orElseThrow();
            Set<Permission> currentPermissions = managedRole.getPermissions() == null
                    ? new LinkedHashSet<>()
                    : new LinkedHashSet<>(managedRole.getPermissions());

            List<Permission> permissionsToAdd = rolePermissionSeed.getPermissionKeys().stream()
                    .map(permissionKey ->
                            resolvePermission(permissionKey, permissionsByKey, rolePermissionSeed.getRoleName()))
                    .filter(Objects::nonNull)
                    .filter(permission -> currentPermissions.stream()
                            .noneMatch(existing -> Objects.equals(existing.getId(), permission.getId())))
                    .toList();

            if (permissionsToAdd.isEmpty()) {
                log.info("Role '{}' đã có đầy đủ permission theo seed.", managedRole.getName());
                continue;
            }

            currentPermissions.addAll(permissionsToAdd);
            managedRole.setPermissions(currentPermissions);
            roleRepository.save(managedRole);
            log.info("Đã gán {} permission còn thiếu cho role '{}'.", permissionsToAdd.size(), managedRole.getName());
        }
    }

    /**
     * Resolve một permission theo key seed để tránh gán nhầm key không tồn tại.
     */
    private Permission resolvePermission(
            String permissionKey, Map<String, Permission> permissionsByKey, String roleName) {
        Permission permission = permissionsByKey.get(permissionKey);
        if (permission == null) {
            log.warn(
                    "Role '{}' tham chiếu permission key='{}' nhưng key này không tồn tại trong seed.",
                    roleName,
                    permissionKey);
        }
        return permission;
    }

    /**
     * Seed hoặc cập nhật subscription plans từ file seed.
     */
    private Map<String, SubscriptionPlan> seedSubscriptionPlans(List<SubscriptionPlanSeedData.PlanSeed> planSeeds) {
        Map<String, SubscriptionPlan> plansByCode = new LinkedHashMap<>();
        for (SubscriptionPlanSeedData.PlanSeed planSeed : planSeeds) {
            SubscriptionPlan plan = subscriptionPlanRepository
                    .findByCode(planSeed.getCode())
                    .map(existingPlan -> {
                        if (applyPlanSeed(existingPlan, planSeed)) {
                            SubscriptionPlan updatedPlan = subscriptionPlanRepository.save(existingPlan);
                            log.info("Đã cập nhật subscription plan code='{}'.", planSeed.getCode());
                            return updatedPlan;
                        }
                        log.info("Subscription plan code='{}' đã tồn tại, bỏ qua tạo mới.", planSeed.getCode());
                        return existingPlan;
                    })
                    .orElseGet(() -> {
                        SubscriptionPlan newPlan = SubscriptionPlan.builder().build();
                        applyPlanSeed(newPlan, planSeed);
                        SubscriptionPlan savedPlan = subscriptionPlanRepository.save(newPlan);
                        log.info("Đã tạo subscription plan code='{}'.", planSeed.getCode());
                        return savedPlan;
                    });

            plansByCode.put(plan.getCode(), plan);
        }
        return plansByCode;
    }

    /**
     * Đồng bộ dữ liệu plan entity với một bản ghi seed.
     */
    private boolean applyPlanSeed(SubscriptionPlan plan, SubscriptionPlanSeedData.PlanSeed planSeed) {
        boolean changed = false;

        if (!Objects.equals(plan.getCode(), planSeed.getCode())) {
            plan.setCode(planSeed.getCode());
            changed = true;
        }
        if (!Objects.equals(plan.getName(), planSeed.getName())) {
            plan.setName(planSeed.getName());
            changed = true;
        }
        if (!Objects.equals(plan.getDescription(), planSeed.getDescription())) {
            plan.setDescription(planSeed.getDescription());
            changed = true;
        }
        if (!Objects.equals(plan.getFullDescription(), planSeed.getFullDescription())) {
            plan.setFullDescription(planSeed.getFullDescription());
            changed = true;
        }
        if (!Objects.equals(plan.getMaxBoardingHouses(), planSeed.getMaxBoardingHouses())) {
            plan.setMaxBoardingHouses(planSeed.getMaxBoardingHouses());
            changed = true;
        }
        if (!Objects.equals(plan.getMaxBuildings(), planSeed.getMaxBuildings())) {
            plan.setMaxBuildings(planSeed.getMaxBuildings());
            changed = true;
        }
        if (!Objects.equals(plan.getMaxRooms(), planSeed.getMaxRooms())) {
            plan.setMaxRooms(planSeed.getMaxRooms());
            changed = true;
        }
        if (!Objects.equals(plan.getMaxTenants(), planSeed.getMaxTenants())) {
            plan.setMaxTenants(planSeed.getMaxTenants());
            changed = true;
        }
        if (!Objects.equals(plan.getMaxActiveContracts(), planSeed.getMaxActiveContracts())) {
            plan.setMaxActiveContracts(planSeed.getMaxActiveContracts());
            changed = true;
        }
        if (!Objects.equals(plan.getPricePerMonth(), planSeed.getPricePerMonth())) {
            plan.setPricePerMonth(planSeed.getPricePerMonth());
            changed = true;
        }
        if (!Objects.equals(plan.getDurationDays(), planSeed.getDurationDays())) {
            plan.setDurationDays(planSeed.getDurationDays());
            changed = true;
        }

        Boolean isActive = planSeed.getIsActive() != null ? planSeed.getIsActive() : Boolean.TRUE;
        if (!Objects.equals(plan.getIsActive(), isActive)) {
            plan.setIsActive(isActive);
            changed = true;
        }

        return changed;
    }

    /**
     * Tạo hoặc cập nhật admin mặc định và gán role admin.
     */
    private void seedAdminUser(Role adminRole) {
        if (adminRole == null) {
            log.warn(
                    "Không tìm thấy role '{}' để gán cho admin mặc định.",
                    seedProperties.getAdmin().getRoleName());
            return;
        }

        if (userRepository.existsByRoles_Name(seedProperties.getAdmin().getRoleName())) {
            log.info(
                    "Đã tồn tại user có role '{}', bỏ qua tạo admin mặc định.",
                    seedProperties.getAdmin().getRoleName());
            return;
        }

        SeedProperties.AdminSeedProperties adminSeed = seedProperties.getAdmin();
        User adminUser =
                userRepository.findByEmail(adminSeed.getEmail()).orElseGet(() -> buildDefaultAdminUser(adminSeed));
        Set<Role> roles =
                adminUser.getRoles() == null ? new LinkedHashSet<>() : new LinkedHashSet<>(adminUser.getRoles());

        if (roles.stream().noneMatch(role -> adminSeed.getRoleName().equals(role.getName()))) {
            roles.add(adminRole);
        }

        adminUser.setRoles(roles);
        adminUser.setEnabled(true);
        adminUser.setAccountNonExpired(true);
        adminUser.setAccountNonLocked(true);
        adminUser.setCredentialsNonExpired(true);
        if (adminUser.getCreateAt() == null) {
            adminUser.setCreateAt(new Date());
        }

        boolean isNewAdmin = adminUser.getId() == null;
        userRepository.save(adminUser);

        if (isNewAdmin) {
            log.warn(
                    "Đã tạo admin mặc định username='{}', email='{}', password='{}'. Hãy đổi mật khẩu sau khi đăng nhập lần đầu.",
                    adminSeed.getUsername(),
                    adminSeed.getEmail(),
                    adminSeed.getPassword());
            return;
        }

        log.info("Đã gán role '{}' cho user email='{}'.", adminSeed.getRoleName(), adminUser.getEmail());
    }

    /**
     * Build user admin mặc định nếu chưa có bản ghi tương ứng trong DB.
     */
    private User buildDefaultAdminUser(SeedProperties.AdminSeedProperties adminSeed) {
        return User.builder()
                .userName(adminSeed.getUsername())
                .email(adminSeed.getEmail())
                .password(passwordEncoder.encode(adminSeed.getPassword()))
                .originalPassword(adminSeed.getPassword())
                .createAt(new Date())
                .enabled(true)
                .accountNonExpired(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .build();
    }

    /**
     * Seed system config default plan dựa trên plan active đã seed.
     */
    private void seedDefaultPlanConfig(Map<String, SubscriptionPlan> plansByCode) {
        if (systemConfigRepository.existsByKey(SystemConfigService.DEFAULT_PLAN_ID)) {
            log.info("System config '{}' đã tồn tại, bỏ qua tạo mới.", SystemConfigService.DEFAULT_PLAN_ID);
            return;
        }

        SubscriptionPlan defaultPlan = subscriptionPlanRepository
                .findByCode(seedProperties.getDefaultPlanCode())
                .filter(SubscriptionPlan::getIsActive)
                .or(() -> {
                    SubscriptionPlan seededPlan = plansByCode.get(seedProperties.getDefaultPlanCode());
                    return seededPlan != null && Boolean.TRUE.equals(seededPlan.getIsActive())
                            ? java.util.Optional.of(seededPlan)
                            : java.util.Optional.empty();
                })
                .or(() -> subscriptionPlanRepository.findFirstByIsActiveTrueOrderByIdAsc())
                .orElse(null);

        if (defaultPlan == null) {
            log.warn("Không tìm thấy subscription plan active để seed '{}'.", SystemConfigService.DEFAULT_PLAN_ID);
            return;
        }

        systemConfigRepository.save(SystemConfig.builder()
                .key(SystemConfigService.DEFAULT_PLAN_ID)
                .value(String.valueOf(defaultPlan.getId()))
                .description("Subscription plan mặc định được gán cho owner mới")
                .build());
        log.info(
                "Đã tạo system config '{}' với plan id={}, code='{}'.",
                SystemConfigService.DEFAULT_PLAN_ID,
                defaultPlan.getId(),
                defaultPlan.getCode());
    }
}
