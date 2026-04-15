package carevn.luv2code.ez_tro.mapper;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.mapstruct.*;

import carevn.luv2code.ez_tro.dto.requests.UtilityRequest;
import carevn.luv2code.ez_tro.dto.response.UtilityResponse;
import carevn.luv2code.ez_tro.entity.BoardingHouse;
import carevn.luv2code.ez_tro.entity.Utility;

@Mapper(componentModel = "spring")
public interface UtilityMapper {

    @Mapping(target = "boardingHouseId", ignore = true)
    @Mapping(target = "boardingHouseName", ignore = true)
    @Mapping(target = "boardingHouseIds", ignore = true)
    @Mapping(target = "boardingHouseNames", ignore = true)
    @Mapping(source = "owner.id", target = "ownerId")
    UtilityResponse toResponseBasic(Utility entity);

    default UtilityResponse toResponse(Utility entity) {
        if (entity == null) {
            return null;
        }

        UtilityResponse response = toResponseBasic(entity);

        List<Integer> boardingHouseIds = entity.getBoardingHouses() == null
                ? Collections.emptyList()
                : entity.getBoardingHouses().stream().map(BoardingHouse::getId).toList();

        List<String> boardingHouseNames = entity.getBoardingHouses() == null
                ? Collections.emptyList()
                : entity.getBoardingHouses().stream()
                        .map(BoardingHouse::getName)
                        .filter(name -> name != null && !name.isEmpty())
                        .collect(Collectors.toList());

        response.setBoardingHouseIds(boardingHouseIds);
        response.setBoardingHouseNames(boardingHouseNames);
        response.setBoardingHouseId(boardingHouseIds.isEmpty() ? null : boardingHouseIds.get(0));
        response.setBoardingHouseName(boardingHouseNames.isEmpty() ? null : String.join(", ", boardingHouseNames));

        return response;
    }

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "boardingHouses", ignore = true)
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Utility toEntity(@MappingTarget Utility entity, UtilityRequest request);

    default Utility toEntity(UtilityRequest request) {
        Utility entity = new Utility();
        toEntity(entity, request);
        return entity;
    }
}
