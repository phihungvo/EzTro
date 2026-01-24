package carevn.luv2code.ez_tro.service.admin.impl;

import carevn.luv2code.ez_tro.entity.UserSubscription;
import carevn.luv2code.ez_tro.enums.SubscriptionStatus;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.repository.*;
import carevn.luv2code.ez_tro.service.admin.ResourceLimitService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResourceLimitServiceImpl implements ResourceLimitService {

    private final UserSubscriptionRepository subscriptionRepo;
    private final BoardingHouseRepository bhRepo;
    private final BuildingRepository buildingRepo;
    private final RoomRepository roomRepo;

    @Override
    public void validateCanCreateBoardingHouse(Integer ownerId) {
        var limits = getLimits(ownerId);
        long current = bhRepo.countByOwnerId(ownerId);
        if (current >= limits.maxBoardingHouses) {
            throw new AppException(ErrorCode.RESOURCE_LIMIT_EXCEEDED);
        }
    }

    @Override
    public void validateCanCreateBuilding(Integer ownerId) {
        var limits = getLimits(ownerId);
        long current = buildingRepo.countByBoardingHouse_Owner_Id(ownerId);
        if (current >= limits.maxBuildings) {
            throw new AppException(ErrorCode.RESOURCE_LIMIT_EXCEEDED);
        }
    }

    @Override
    public void validateCanCreateRoom(Integer ownerId) {
        var limits = getLimits(ownerId);
        long current = roomRepo.countByBoardingHouse_Owner_Id(ownerId);
        if (current >= limits.maxRooms) {
            throw new AppException(ErrorCode.RESOURCE_LIMIT_EXCEEDED);
        }
    }

    private Limits getLimits(Integer ownerId) {
        UserSubscription sub = subscriptionRepo.findActiveByOwnerId(ownerId, SubscriptionStatus.ACTIVE)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_LIMIT_EXCEEDED));

        int maxBH = sub.getOverrideMaxBoardingHouses() != null
                ? sub.getOverrideMaxBoardingHouses()
                : sub.getPlan().getMaxBoardingHouses();

        int maxB = sub.getOverrideMaxBuildings() != null
                ? sub.getOverrideMaxBuildings()
                : sub.getPlan().getMaxBuildings();

        int maxR = sub.getOverrideMaxRooms() != null
                ? sub.getOverrideMaxRooms()
                : sub.getPlan().getMaxRooms();

        return new Limits(maxBH, maxB, maxR);
    }

    private record Limits(int maxBoardingHouses, int maxBuildings, int maxRooms) {
    }
}