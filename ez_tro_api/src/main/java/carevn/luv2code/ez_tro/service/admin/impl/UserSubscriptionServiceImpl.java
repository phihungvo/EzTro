package carevn.luv2code.ez_tro.service.admin.impl;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.OwnerResourceLimits;
import carevn.luv2code.ez_tro.dto.UserSubscriptionDTO;
import carevn.luv2code.ez_tro.dto.requests.AssignSubscriptionRequest;
import carevn.luv2code.ez_tro.dto.requests.OverrideLimitsRequest;
import carevn.luv2code.ez_tro.dto.response.OwnerLimitsResponse;
import carevn.luv2code.ez_tro.entity.SubscriptionPlan;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.entity.UserSubscription;
import carevn.luv2code.ez_tro.enums.ContractStatus;
import carevn.luv2code.ez_tro.enums.SubscriptionStatus;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.UserSubscriptionMapper;
import carevn.luv2code.ez_tro.repository.*;
import carevn.luv2code.ez_tro.security.AuthorizationService;
import carevn.luv2code.ez_tro.service.admin.UserSubscriptionService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserSubscriptionServiceImpl implements UserSubscriptionService {

    private final AuthorizationService authorizationService;
    private final UserSubscriptionRepository subscriptionRepo;
    private final SubscriptionPlanRepository planRepo;
    private final UserRepository userRepo;
    private final BoardingHouseRepository bhRepo;
    private final BuildingRepository buildingRepo;
    private final RoomRepository roomRepo;
    private final TenantRepository tenantRepo;
    private final ContractRepository contractRepo;
    private final UserSubscriptionMapper mapper;

    // ========== ASSIGN SUBSCRIPTION ==========

    @Transactional
    @Override
    public UserSubscriptionDTO assignSubscription(AssignSubscriptionRequest request) {
        User owner =
                userRepo.findById(request.getOwnerId()).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!authorizationService.isUserAnOwner(owner.getId())) {
            throw new AppException(ErrorCode.NOT_AN_OWNER);
        }

        SubscriptionPlan plan = planRepo.findById(request.getPlanId())
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND));

        // Hủy gói active cũ nếu có (tùy nghiệp vụ)
        subscriptionRepo
                .findActiveByOwnerId(owner.getId(), SubscriptionStatus.ACTIVE)
                .ifPresent(old -> {
                    old.setStatus(SubscriptionStatus.CANCELLED);
                    subscriptionRepo.save(old);
                });

        UserSubscription sub = mapper.toEntity(request);
        sub.setOwner(owner);
        sub.setPlan(plan);
        sub.setStatus(request.getStatus() != null ? request.getStatus() : SubscriptionStatus.ACTIVE);

        if (sub.getStartDate() == null) {
            sub.setStartDate(LocalDateTime.now());
        }

        sub = subscriptionRepo.save(sub);
        return mapper.toDTO(sub);
    }

    // ========== OVERRIDE LIMITS ==========

    @Transactional
    @Override
    public UserSubscriptionDTO overrideLimits(Long subscriptionId, OverrideLimitsRequest request) {
        UserSubscription sub = subscriptionRepo
                .findById(subscriptionId)
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_NOT_FOUND));

        sub.setOverrideMaxBoardingHouses(request.getOverrideMaxBoardingHouses());
        sub.setOverrideMaxBuildings(request.getOverrideMaxBuildings());
        sub.setOverrideMaxRooms(request.getOverrideMaxRooms());
        sub.setOverrideMaxTenants(request.getOverrideMaxTenants());
        sub.setOverrideMaxContracts(request.getOverrideMaxContracts());

        sub = subscriptionRepo.save(sub);
        return mapper.toDTO(sub);
    }

    // ========== GET CURRENT LIMITS (dùng record chung) ==========

    @Transactional(readOnly = true)
    @Override
    public OwnerLimitsResponse getCurrentLimits(Integer ownerId) {
        UserSubscription sub = subscriptionRepo
                .findActiveByOwnerId(ownerId, SubscriptionStatus.ACTIVE)
                .orElseThrow(() -> new AppException(ErrorCode.NO_ACTIVE_SUBSCRIPTION));

        OwnerResourceLimits limits = calculateLimits(sub);

        long currentBH = bhRepo.countByOwnerId(ownerId);
        long currentB = buildingRepo.countByBoardingHouse_Owner_Id(ownerId);
        long currentR = roomRepo.countByBoardingHouse_Owner_Id(ownerId);
        long currentT = tenantRepo.countByOwnerId(ownerId);
        long currentC = contractRepo.countByOwnerIdAndStatus(ownerId, ContractStatus.ACTIVE);

        return OwnerLimitsResponse.builder()
                .maxBoardingHouses(limits.maxBoardingHouses())
                .currentBoardingHouses(currentBH)
                .maxBuildings(limits.maxBuildings())
                .currentBuildings(currentB)
                .maxRooms(limits.maxRooms())
                .currentRooms(currentR)
                .maxTenants(limits.maxTenants())
                .currentTenants(currentT)
                .maxContracts(limits.maxActiveContracts())
                .currentContracts(currentC)
                .planName(sub.getPlan().getName())
                .status(sub.getStatus().name())
                .build();
    }

    // ========== HELPER ==========

    private OwnerResourceLimits calculateLimits(UserSubscription sub) {
        SubscriptionPlan plan = sub.getPlan();
        if (plan == null) {
            throw new AppException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND);
        }

        return new OwnerResourceLimits(
                getOrOverride(sub.getOverrideMaxBoardingHouses(), plan.getMaxBoardingHouses()),
                getOrOverride(sub.getOverrideMaxBuildings(), plan.getMaxBuildings()),
                getOrOverride(sub.getOverrideMaxRooms(), plan.getMaxRooms()),
                getOrOverride(sub.getOverrideMaxTenants(), plan.getMaxTenants()),
                getOrOverride(sub.getOverrideMaxContracts(), plan.getMaxActiveContracts()));
    }

    private int getOrOverride(Integer overrideValue, int defaultValue) {
        return overrideValue != null ? overrideValue : defaultValue;
    }
}
