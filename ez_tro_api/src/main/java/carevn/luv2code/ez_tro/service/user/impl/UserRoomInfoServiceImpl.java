package carevn.luv2code.ez_tro.service.user.impl;

import java.time.LocalDate;

import org.springframework.stereotype.Service;

import carevn.luv2code.ez_tro.dto.response.ContractSnapshotResponse;
import carevn.luv2code.ez_tro.dto.response.CurrentRentalInfoResponse;
import carevn.luv2code.ez_tro.dto.response.TenantRoomInfoResponse;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.enums.ContractStatus;
import carevn.luv2code.ez_tro.repository.ContractRepository;
import carevn.luv2code.ez_tro.service.admin.ContractSnapshotService;
import carevn.luv2code.ez_tro.service.user.UserRoomInfoService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserRoomInfoServiceImpl implements UserRoomInfoService {

    private final ContractRepository contractRepository;
    private final ContractSnapshotService contractSnapshotService;

    @Override
    public TenantRoomInfoResponse getCurrentRoomInfo(Integer userId) {
        var contractOpt = contractRepository.findActiveContractByUserId(userId, ContractStatus.ACTIVE, LocalDate.now());

        if (contractOpt.isEmpty()) {
            return TenantRoomInfoResponse.builder().status("Chưa Có Phòng").build();
        }

        Contract contract = contractOpt.get();
        var room = contract.getRoom();

        return TenantRoomInfoResponse.builder()
                .roomNumber(room.getRoomNumber())
                .buildingName(room.getBuilding().getName())
                .floor(room.getFloorNumber())
                .area(room.getArea())
                .price(room.getPrice())
                .status("Đang Ở")
                .build();
    }

    @Override
    public CurrentRentalInfoResponse getCurrentContractInfo(Integer userId) {
        var contractOpt = contractRepository.findActiveContractByUserId(userId, ContractStatus.ACTIVE, LocalDate.now());

        if (contractOpt.isEmpty()) {
            return CurrentRentalInfoResponse.builder()
                    .contractStatus("Chưa thuê")
                    .isLiving(false)
                    .build();
        }

        Contract contract = contractOpt.get();
        ContractSnapshotResponse snapshot = contractSnapshotService.getSnapshot(contract.getId(), LocalDate.now());

        return CurrentRentalInfoResponse.builder()
                .contractCode(contract.getContractCode())
                .contractStatus("Đang Hiệu Lực")
                .isLiving(true)
                .startDate(contract.getStartDate())
                .endDate(contract.getEndDate())
                .rentPrice(
                        snapshot.getCurrentVersion() != null
                                ? snapshot.getCurrentVersion().getPrice()
                                : contract.getRentPrice())
                .deposit(
                        snapshot.getCurrentVersion() != null
                                ? snapshot.getCurrentVersion().getDepositAmount()
                                : contract.getDeposit())
                .moveInDate(contract.getStartDate())
                .isContractRepresentative(true)
                .roomName(contract.getRoom().getRoomNumber())
                .floorNumber(contract.getRoom().getFloorNumber())
                .area(contract.getRoom().getArea())
                .boardingHouseName(contract.getRoom().getBoardingHouse().getName())
                .boardingHouseAddress(contract.getRoom().getBoardingHouse().getAddress())
                .build();
    }
}
