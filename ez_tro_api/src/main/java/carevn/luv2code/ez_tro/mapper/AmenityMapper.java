package carevn.luv2code.ez_tro.mapper;

import java.util.List;

import org.mapstruct.*;

import carevn.luv2code.ez_tro.dto.requests.AmenityRequest;
import carevn.luv2code.ez_tro.dto.response.AmenityResponse;
import carevn.luv2code.ez_tro.entity.Amenity;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AmenityMapper {

    @Mapping(target = "unitPrice", source = "price")
    @Mapping(target = "boardingHouse", ignore = true)
    @Mapping(target = "roomAmenities", ignore = true)
    Amenity toEntity(AmenityRequest request);

    @Mapping(source = "boardingHouse.id", target = "boardingHouseId")
    @Mapping(source = "boardingHouse.name", target = "boardingHouseName")
    @Mapping(source = "unitPrice", target = "price")
    @Mapping(source = "createdAt", target = "createdAt")
    @Mapping(source = "updatedAt", target = "updatedAt")
    AmenityResponse toResponse(Amenity amenity);

    List<AmenityResponse> toResponseList(List<Amenity> amenities);

    @Mapping(target = "unitPrice", source = "price")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "boardingHouse", ignore = true)
    @Mapping(target = "roomAmenities", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget Amenity amenity, AmenityRequest request);
}
