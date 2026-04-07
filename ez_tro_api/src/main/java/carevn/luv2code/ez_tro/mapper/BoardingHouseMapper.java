package carevn.luv2code.ez_tro.mapper;

import org.mapstruct.*;

import carevn.luv2code.ez_tro.dto.requests.BoardingHouseRequest;
import carevn.luv2code.ez_tro.dto.response.BoardingHouseResponse;
import carevn.luv2code.ez_tro.entity.BoardingHouse;

@Mapper(componentModel = "spring")
public interface BoardingHouseMapper {
    @Mapping(source = "owner.id", target = "ownerId")
    @Mapping(source = "owner.fullName", target = "ownerName")
    @Mapping(source = "owner.email", target = "ownerEmail")
    BoardingHouseResponse toResponse(BoardingHouse entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "buildings", ignore = true)
    BoardingHouse toEntity(BoardingHouseRequest request);
}
