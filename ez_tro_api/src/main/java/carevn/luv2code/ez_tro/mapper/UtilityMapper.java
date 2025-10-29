package carevn.luv2code.ez_tro.mapper;

import org.mapstruct.*;

import carevn.luv2code.ez_tro.dto.requests.UtilityRequest;
import carevn.luv2code.ez_tro.dto.response.UtilityResponse;
import carevn.luv2code.ez_tro.entity.Utility;

@Mapper(componentModel = "spring")
public interface UtilityMapper {

    @Mapping(source = "boardingHouse.id", target = "boardingHouseId")
    @Mapping(source = "boardingHouse.name", target = "boardingHouseName")
    UtilityResponse toResponse(Utility entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "boardingHouse", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Utility toEntity(@MappingTarget Utility entity, UtilityRequest request);

    default Utility toEntity(UtilityRequest request) {
        Utility entity = new Utility();
        toEntity(entity, request);
        return entity;
    }
}
