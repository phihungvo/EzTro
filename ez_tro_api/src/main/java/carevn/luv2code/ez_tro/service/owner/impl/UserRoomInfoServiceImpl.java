package carevn.luv2code.ez_tro.service.owner.impl;

import java.time.LocalDate;

import org.springframework.stereotype.Service;

import carevn.luv2code.ez_tro.dto.response.TenantRoomInfoResponse;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.enums.ContractStatus;
import carevn.luv2code.ez_tro.repository.ContractRepository;
import carevn.luv2code.ez_tro.service.owner.UserRoomInfoService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserRoomInfoServiceImpl implements UserRoomInfoService {

    private final ContractRepository contractRepository;

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
}
