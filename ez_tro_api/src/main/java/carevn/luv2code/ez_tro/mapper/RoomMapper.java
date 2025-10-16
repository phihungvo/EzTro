package carevn.luv2code.ez_tro.mapper;

import org.mapstruct.*;

import carevn.luv2code.ez_tro.dto.requests.RoomRequest;
import carevn.luv2code.ez_tro.dto.response.RoomResponse;
import carevn.luv2code.ez_tro.entity.Room;

@Mapper(componentModel = "spring")
public interface RoomMapper {
    @Mapping(source = "boardingHouse.name", target = "boardingHouseName")
    RoomResponse toResponse(Room room);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "boardingHouse", ignore = true)
    @Mapping(target = "contracts", ignore = true)
    @Mapping(target = "electricWaterRecords", ignore = true)
    Room toEntity(RoomRequest request);
}
