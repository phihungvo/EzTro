package carevn.luv2code.ez_tro.service.admin.impl;

import carevn.luv2code.ez_tro.dto.UserSubscriptionDTO;
import carevn.luv2code.ez_tro.dto.requests.AssignSubscriptionRequest;
import carevn.luv2code.ez_tro.dto.requests.OverrideLimitsRequest;
import carevn.luv2code.ez_tro.dto.response.OwnerLimitsResponse;
import carevn.luv2code.ez_tro.entity.SubscriptionPlan;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.entity.UserSubscription;
import carevn.luv2code.ez_tro.enums.SubscriptionStatus;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.UserSubscriptionMapper;
import carevn.luv2code.ez_tro.repository.*;
import carevn.luv2code.ez_tro.security.AuthorizationService;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.UserSubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

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
    private final UserSubscriptionMapper mapper;

    @Transactional
    public UserSubscriptionDTO assignSubscription(AssignSubscriptionRequest request) {
        // Tìm owner (người nhận gói) và kiểm tra phải là OWNER
        User owner = userRepo.findById(request.getOwnerId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!authorizationService.isUserAnOwner(owner.getId())) {
            throw new AppException(ErrorCode.NOT_AN_OWNER);
        }

        SubscriptionPlan plan = planRepo.findById(request.getPlanId())
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND));

        // Kiểm tra owner đã có subscription ACTIVE chưa
        Optional<UserSubscription> existingActive = subscriptionRepo.findActiveByOwnerId(owner.getId(), SubscriptionStatus.ACTIVE);
        if (existingActive.isPresent()) {
            // Option 1: Không cho phép gán mới nếu đã có active
            // throw new AppException(ErrorCode.ALREADY_HAS_ACTIVE_SUBSCRIPTION);

            // Option 2: Tự động hủy gói cũ (nếu nghiệp vụ cho phép)
            UserSubscription old = existingActive.get();
            old.setStatus(SubscriptionStatus.CANCELLED);
            subscriptionRepo.save(old);
        }

        // 5. Tạo subscription mới
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

//    @Transactional
//    public UserSubscriptionDTO assignSubscription(AssignSubscriptionRequest request) {
//        User owner = userRepo.findById(request.getOwnerId())
//                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
//
//        if (!SecurityUtils.isOwner()) {
//            throw new AppException(ErrorCode.NOT_AN_OWNER);
//        }
//
//        SubscriptionPlan plan = planRepo.findById(request.getPlanId())
//                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND));
//
//        UserSubscription sub = mapper.toEntity(request);
//        sub.setOwner(owner);
//        sub.setPlan(plan);
//        sub.setStatus(request.getStatus() != null ? request.getStatus() : SubscriptionStatus.ACTIVE);
//
//        sub = subscriptionRepo.save(sub);
//        return mapper.toDTO(sub);
//    }

    @Transactional
    public UserSubscriptionDTO overrideLimits(Long subscriptionId, OverrideLimitsRequest request) {
        UserSubscription sub = subscriptionRepo.findById(subscriptionId)
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_NOT_FOUND));

        sub.setOverrideMaxBoardingHouses(request.getOverrideMaxBoardingHouses());
        sub.setOverrideMaxBuildings(request.getOverrideMaxBuildings());
        sub.setOverrideMaxRooms(request.getOverrideMaxRooms());

        sub = subscriptionRepo.save(sub);
        return mapper.toDTO(sub);
    }

    @Transactional(readOnly = true)
    public OwnerLimitsResponse getCurrentLimits(Integer ownerId) {
        UserSubscription sub = subscriptionRepo.findActiveByOwnerId(ownerId, SubscriptionStatus.ACTIVE)
                .orElseThrow(() -> new AppException(ErrorCode.NO_ACTIVE_SUBSCRIPTION));

        int maxBH = sub.getOverrideMaxBoardingHouses() != null
                ? sub.getOverrideMaxBoardingHouses()
                : sub.getPlan().getMaxBoardingHouses();

        int maxB = sub.getOverrideMaxBuildings() != null
                ? sub.getOverrideMaxBuildings()
                : sub.getPlan().getMaxBuildings();

        int maxR = sub.getOverrideMaxRooms() != null
                ? sub.getOverrideMaxRooms()
                : sub.getPlan().getMaxRooms();

        return OwnerLimitsResponse.builder()
                .maxBoardingHouses(maxBH)
                .currentBoardingHouses(bhRepo.countByOwnerId(ownerId))
                .maxBuildings(maxB)
                .currentBuildings(buildingRepo.countByBoardingHouse_Owner_Id(ownerId))
                .maxRooms(maxR)
                .currentRooms(roomRepo.countByBoardingHouse_Owner_Id(ownerId))
                .planName(sub.getPlan().getName())
                .status(sub.getStatus().toString())
                .build();
    }
}