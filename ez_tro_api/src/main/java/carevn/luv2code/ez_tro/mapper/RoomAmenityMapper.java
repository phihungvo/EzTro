package carevn.luv2code.ez_tro.mapper;

import java.util.List;

import org.mapstruct.*;

import carevn.luv2code.ez_tro.dto.response.RoomAmenityResponse;
import carevn.luv2code.ez_tro.entity.RoomAmenity;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RoomAmenityMapper {

    @Mapping(source = "id.roomId", target = "roomId")
    @Mapping(source = "room.roomNumber", target = "roomName")
    @Mapping(source = "id.amenityId", target = "amenityId")
    @Mapping(source = "amenity.name", target = "amenityName")
    //    @Mapping(target = "isActive", expression = "java(entity.getEndDate() == null ||
    // entity.getEndDate().isAfter(LocalDate.now()))")
    @Mapping(target = "id", ignore = true)
    RoomAmenityResponse toResponse(RoomAmenity entity);

    //    @IterableMapping(qualifiedByName = "toResponse")
    List<RoomAmenityResponse> toResponseList(List<RoomAmenity> entities);
}
