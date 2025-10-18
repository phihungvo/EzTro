package carevn.luv2code.ez_tro.mapper;

import org.mapstruct.*;

import carevn.luv2code.ez_tro.dto.requests.BuildingRequest;
import carevn.luv2code.ez_tro.dto.response.BuildingResponse;
import carevn.luv2code.ez_tro.entity.Building;

@Mapper(componentModel = "spring")
public interface BuildingMapper {

    @Mapping(source = "boardingHouse.id", target = "boardingHouseId")
    @Mapping(source = "boardingHouse.name", target = "boardingHouseName")
    BuildingResponse toResponse(Building entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "rooms", ignore = true)
    @Mapping(target = "boardingHouse", ignore = true)
    Building toEntity(BuildingRequest request);
}
