package carevn.luv2code.ez_tro.service.admin.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.OwnerResourceLimits;
import carevn.luv2code.ez_tro.entity.UserSubscription;
import carevn.luv2code.ez_tro.enums.ContractStatus;
import carevn.luv2code.ez_tro.enums.SubscriptionStatus;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.repository.*;
import carevn.luv2code.ez_tro.service.admin.ResourceLimitService;
import lombok.RequiredArgsConstructor;

/**
 * Service kiểm tra giới hạn tài nguyên (resource limits) theo subscription của owner.
 *
 * <p>Giới hạn bao gồm: số boarding houses, buildings, rooms, tenants, và số hợp đồng ACTIVE tối đa.
 * Các service tạo mới entity sẽ gọi các method validate tương ứng để chặn vượt quota.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResourceLimitServiceImpl implements ResourceLimitService {

    private final UserSubscriptionRepository subscriptionRepo;
    private final BoardingHouseRepository bhRepo;
    private final BuildingRepository buildingRepo;
    private final RoomRepository roomRepo;
    private final TenantRepository tenantRepo;
    private final ContractRepository contractRepo;

    // ========== VALIDATE CREATE ==========

    /**
     * Kiểm tra owner có thể tạo thêm khu nhà trọ hay không.
     *
     * @param ownerId id owner
     */
    @Override
    public void validateCanCreateBoardingHouse(Integer ownerId) {
        OwnerResourceLimits limits = getLimits(ownerId);
        long current = bhRepo.countByOwnerId(ownerId);
        if (current >= limits.maxBoardingHouses()) {
            throw new AppException(ErrorCode.RESOURCE_LIMIT_EXCEEDED);
        }
    }

    /**
     * Kiểm tra owner có thể tạo thêm building hay không.
     *
     * @param ownerId id owner
     */
    @Override
    public void validateCanCreateBuilding(Integer ownerId) {
        OwnerResourceLimits limits = getLimits(ownerId);
        long current = buildingRepo.countByBoardingHouse_Owner_Id(ownerId);
        if (current >= limits.maxBuildings()) {
            throw new AppException(ErrorCode.RESOURCE_LIMIT_EXCEEDED);
        }
    }

    /**
     * Kiểm tra owner có thể tạo thêm room hay không.
     *
     * @param ownerId id owner
     */
    @Override
    public void validateCanCreateRoom(Integer ownerId) {
        OwnerResourceLimits limits = getLimits(ownerId);
        long current = roomRepo.countByBoardingHouse_Owner_Id(ownerId);
        if (current >= limits.maxRooms()) {
            throw new AppException(ErrorCode.RESOURCE_LIMIT_EXCEEDED);
        }
    }

    /**
     * Kiểm tra owner có thể tạo thêm tenant hay không.
     *
     * @param ownerId id owner
     */
    @Override
    public void validateCanCreateTenant(Integer ownerId) {
        OwnerResourceLimits limits = getLimits(ownerId);
        long current = tenantRepo.countByOwnerId(ownerId);
        if (current >= limits.maxTenants()) {
            throw new AppException(ErrorCode.RESOURCE_LIMIT_EXCEEDED);
        }
    }

    /**
     * Kiểm tra owner có thể tạo thêm hợp đồng ACTIVE hay không.
     *
     * @param ownerId id owner
     */
    @Override
    public void validateCanCreateContract(Integer ownerId) {
        OwnerResourceLimits limits = getLimits(ownerId);
        long currentActive = contractRepo.countByOwnerIdAndStatus(ownerId, ContractStatus.ACTIVE);
        if (currentActive >= limits.maxActiveContracts()) {
            throw new AppException(ErrorCode.RESOURCE_LIMIT_EXCEEDED);
        }
    }

    // ========== GET LIMITS (dùng record) ==========

    private OwnerResourceLimits getLimits(Integer ownerId) {
        UserSubscription sub = subscriptionRepo
                .findActiveByOwnerId(ownerId, SubscriptionStatus.ACTIVE)
                .orElseThrow(() -> new AppException(ErrorCode.NO_ACTIVE_SUBSCRIPTION));

        if (sub.getPlan() == null) {
            throw new AppException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND);
        }

        return new OwnerResourceLimits(
                getOrOverride(sub.getOverrideMaxBoardingHouses(), sub.getPlan().getMaxBoardingHouses()),
                getOrOverride(sub.getOverrideMaxBuildings(), sub.getPlan().getMaxBuildings()),
                getOrOverride(sub.getOverrideMaxRooms(), sub.getPlan().getMaxRooms()),
                getOrOverride(sub.getOverrideMaxTenants(), sub.getPlan().getMaxTenants()),
                getOrOverride(sub.getOverrideMaxContracts(), sub.getPlan().getMaxActiveContracts()));
    }

    private int getOrOverride(Integer overrideValue, int defaultValue) {
        return overrideValue != null ? overrideValue : defaultValue;
    }
}
