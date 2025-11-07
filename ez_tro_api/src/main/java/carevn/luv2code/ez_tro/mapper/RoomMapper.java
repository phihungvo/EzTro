package carevn.luv2code.ez_tro.mapper;

import java.util.Comparator;

import org.mapstruct.*;

import carevn.luv2code.ez_tro.dto.requests.RoomRequest;
import carevn.luv2code.ez_tro.dto.response.RoomResponse;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.Room;
import carevn.luv2code.ez_tro.enums.ContractStatus;

@Mapper(componentModel = "spring")
public interface RoomMapper {

    @Mapping(source = "boardingHouse.name", target = "boardingHouseName")
    @Mapping(source = "building.name", target = "buildingName")
    @Mapping(target = "startDate", expression = "java(getLatestContractStartDate(room))")
    @Mapping(target = "endDate", expression = "java(getLatestContractEndDate(room))")
    RoomResponse toResponse(Room room);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "boardingHouse", ignore = true)
    @Mapping(target = "building", ignore = true)
    @Mapping(target = "contracts", ignore = true)
    @Mapping(target = "electricWaterRecords", ignore = true)
    @Mapping(target = "roomUtilities", ignore = true)
    Room toEntity(RoomRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "boardingHouse", ignore = true)
    @Mapping(target = "building", ignore = true)
    @Mapping(target = "roomUtilities", ignore = true)
    void updateRoomFromRequest(RoomRequest request, @MappingTarget Room room);

    default java.util.Date getLatestContractStartDate(Room room) {
        if (room.getContracts() == null || room.getContracts().isEmpty()) return null;
        return room.getContracts().stream()
                .filter(c -> c.getStatus() == ContractStatus.ACTIVE)
                .max(Comparator.comparing(Contract::getStartDate))
                .map(Contract::getStartDate)
                .orElse(null);
    }

    default java.util.Date getLatestContractEndDate(Room room) {
        if (room.getContracts() == null || room.getContracts().isEmpty()) return null;
        return room.getContracts().stream()
                .filter(c -> c.getStatus() == ContractStatus.ACTIVE)
                .max(Comparator.comparing(Contract::getStartDate))
                .map(Contract::getEndDate)
                .orElse(null);
    }
}
