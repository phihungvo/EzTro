package carevn.luv2code.ez_tro.mapper;

import org.mapstruct.*;

import carevn.luv2code.ez_tro.dto.requests.RoomUtilityRequest;
import carevn.luv2code.ez_tro.dto.response.RoomUtilityResponse;
import carevn.luv2code.ez_tro.entity.RoomUtility;

@Mapper(componentModel = "spring")
public interface RoomUtilityMapper {

    @Mapping(source = "id.roomId", target = "roomId")
    @Mapping(source = "room.roomNumber", target = "roomNumber")
    @Mapping(source = "id.utilityId", target = "utilityId")
    @Mapping(source = "utility.name", target = "utilityName")
    RoomUtilityResponse toResponse(RoomUtility entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "room", ignore = true)
    @Mapping(target = "utility", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    RoomUtility toEntity(@MappingTarget RoomUtility entity, RoomUtilityRequest request);

    default RoomUtility toEntity(RoomUtilityRequest request) {
        RoomUtility entity = new RoomUtility();
        toEntity(entity, request);
        return entity;
    }
}
