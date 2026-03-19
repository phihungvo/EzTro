package carevn.luv2code.ez_tro.service.admin.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.requests.SystemConfigRequest;
import carevn.luv2code.ez_tro.dto.response.DefaultPlanConfigResponse;
import carevn.luv2code.ez_tro.dto.response.SystemConfigResponse;
import carevn.luv2code.ez_tro.entity.SubscriptionPlan;
import carevn.luv2code.ez_tro.entity.SystemConfig;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.entity.UserSubscription;
import carevn.luv2code.ez_tro.enums.SubscriptionStatus;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.repository.SubscriptionPlanRepository;
import carevn.luv2code.ez_tro.repository.SystemConfigRepository;
import carevn.luv2code.ez_tro.repository.UserSubscriptionRepository;
import carevn.luv2code.ez_tro.service.admin.SystemConfigService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SystemConfigServiceImpl implements SystemConfigService {

    private final SystemConfigRepository systemConfigRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;

    @Value("${app.system-config.default-plan-id:}")
    private String defaultPlanIdFromEnv;

    @Override
    @Transactional
    @CacheEvict(value = "systemConfigs", allEntries = true)
    public SystemConfigResponse create(SystemConfigRequest request) {
        if (systemConfigRepository.existsByKey(request.getKey())) {
            throw new AppException(ErrorCode.SYSTEM_CONFIG_KEY_ALREADY_EXISTS);
        }

        SystemConfig config = SystemConfig.builder()
                .key(request.getKey().trim())
                .value(request.getValue().trim())
                .description(request.getDescription())
                .build();
        return toResponse(systemConfigRepository.save(config));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SystemConfigResponse> getAll() {
        return systemConfigRepository.findAllByOrderByKeyAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SystemConfigResponse getById(Integer id) {
        return toResponse(findConfigById(id));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "systemConfigs", key = "#key")
    public SystemConfigResponse getByKey(String key) {
        return toResponse(findConfigByKey(key));
    }

    @Override
    @Transactional
    @CacheEvict(value = "systemConfigs", allEntries = true)
    public SystemConfigResponse update(Integer id, SystemConfigRequest request) {
        SystemConfig config = findConfigById(id);
        String normalizedKey = request.getKey().trim();

        if (!config.getKey().equals(normalizedKey) && systemConfigRepository.existsByKey(normalizedKey)) {
            throw new AppException(ErrorCode.SYSTEM_CONFIG_KEY_ALREADY_EXISTS);
        }

        config.setKey(normalizedKey);
        config.setValue(request.getValue().trim());
        config.setDescription(request.getDescription());
        return toResponse(systemConfigRepository.save(config));
    }

    @Override
    @Transactional
    @CacheEvict(value = "systemConfigs", allEntries = true)
    public void delete(Integer id) {
        systemConfigRepository.delete(findConfigById(id));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "systemConfigs", key = "#key")
    public String getRequiredValue(String key) {
        return systemConfigRepository.findByKey(key).map(SystemConfig::getValue).orElseGet(() -> fallbackValueFor(key));
    }

    @Override
    @Transactional(readOnly = true)
    public SubscriptionPlan getDefaultPlan() {
        // default_plan_id giờ là một system config bình thường, chỉ có thêm helper nghiệp vụ để đọc ra plan.
        int planId;
        try {
            planId = Integer.parseInt(getRequiredValue(DEFAULT_PLAN_ID));
        } catch (NumberFormatException ex) {
            throw new AppException(ErrorCode.SYSTEM_CONFIG_INVALID_VALUE);
        }

        return resolveActivePlan(planId);
    }

    @Override
    @Transactional(readOnly = true)
    public DefaultPlanConfigResponse getDefaultPlanConfig() {
        // API quản trị cần cả raw config lẫn metadata của plan hiện đang được trỏ tới.
        SystemConfig config = findConfigByKeyOrFallback(DEFAULT_PLAN_ID);
        SubscriptionPlan plan = getDefaultPlan();

        return DefaultPlanConfigResponse.builder()
                .key(config.getKey())
                .value(config.getValue())
                .planId(plan.getId())
                .planCode(plan.getCode())
                .planName(plan.getName())
                .planActive(plan.getIsActive())
                .updatedAt(config.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    @CacheEvict(value = "systemConfigs", key = "'" + DEFAULT_PLAN_ID + "'")
    public void setDefaultPlan(Integer planId) {
        // Chỉ cho phép set plan còn active để tránh owner mới nhận gói đã bị vô hiệu hóa.
        SubscriptionPlan plan = resolveActivePlan(planId);

        SystemConfig config = systemConfigRepository.findByKey(DEFAULT_PLAN_ID).orElseGet(() -> SystemConfig.builder()
                .key(DEFAULT_PLAN_ID)
                .description("Subscription plan mặc định được gán cho owner mới")
                .build());
        config.setValue(String.valueOf(plan.getId()));
        systemConfigRepository.save(config);
    }

    @Override
    @Transactional
    public void ensureDefaultSubscriptionForOwner(User user) {
        // Project dùng UserSubscription cho owner, không gắn plan trực tiếp lên User.
        if (user == null || user.getId() == null || !isOwner(user)) {
            return;
        }

        boolean hasActiveSubscription = userSubscriptionRepository
                .findActiveByOwnerId(user.getId(), SubscriptionStatus.ACTIVE)
                .isPresent();
        if (hasActiveSubscription) {
            return;
        }

        SubscriptionPlan defaultPlan = getDefaultPlan();
        UserSubscription subscription = UserSubscription.builder()
                .owner(user)
                .plan(defaultPlan)
                .startDate(LocalDateTime.now())
                .status(SubscriptionStatus.ACTIVE)
                .build();
        userSubscriptionRepository.save(subscription);
    }

    private boolean isOwner(User user) {
        return user.getRoles() != null && user.getRoles().stream().anyMatch(role -> "OWNER".equals(role.getName()));
    }

    private SystemConfig findConfigById(Integer id) {
        return systemConfigRepository
                .findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SYSTEM_CONFIG_NOT_FOUND));
    }

    private SystemConfig findConfigByKey(String key) {
        return systemConfigRepository
                .findByKey(key)
                .orElseThrow(() -> new AppException(ErrorCode.SYSTEM_CONFIG_NOT_FOUND));
    }

    private SystemConfig findConfigByKeyOrFallback(String key) {
        return systemConfigRepository.findByKey(key).orElseGet(() -> {
            String fallbackValue = fallbackValueFor(key);
            return SystemConfig.builder()
                    .key(key)
                    .value(fallbackValue)
                    .description("Fallback từ biến môi trường, chưa được persist vào database")
                    .build();
        });
    }

    private SystemConfigResponse toResponse(SystemConfig config) {
        return SystemConfigResponse.builder()
                .id(config.getId())
                .key(config.getKey())
                .value(config.getValue())
                .description(config.getDescription())
                .createdAt(config.getCreatedAt())
                .updatedAt(config.getUpdatedAt())
                .build();
    }

    private String fallbackValueFor(String key) {
        if (DEFAULT_PLAN_ID.equals(key) && defaultPlanIdFromEnv != null && !defaultPlanIdFromEnv.isBlank()) {
            return defaultPlanIdFromEnv.trim();
        }
        throw new AppException(ErrorCode.SYSTEM_CONFIG_NOT_FOUND);
    }

    private SubscriptionPlan resolveActivePlan(Integer planId) {
        // Tách riêng helper để mọi luồng lấy/set default plan dùng chung một rule validate.
        SubscriptionPlan plan = subscriptionPlanRepository
                .findById(planId)
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND));
        if (!Boolean.TRUE.equals(plan.getIsActive())) {
            throw new AppException(ErrorCode.DEFAULT_SUBSCRIPTION_PLAN_INACTIVE);
        }
        return plan;
    }
}
