package carevn.luv2code.ez_tro.mapper;

import org.mapstruct.*;

import carevn.luv2code.ez_tro.dto.requests.PropertyAssetRequest;
import carevn.luv2code.ez_tro.dto.response.PropertyAssetHistoryResponse;
import carevn.luv2code.ez_tro.dto.response.PropertyAssetResponse;
import carevn.luv2code.ez_tro.entity.PropertyAsset;
import carevn.luv2code.ez_tro.entity.PropertyAssetHistory;

@Mapper(componentModel = "spring")
public interface PropertyAssetMapper {

    @Mapping(source = "boardingHouse.id", target = "boardingHouseId")
    @Mapping(source = "boardingHouse.name", target = "boardingHouseName")
    @Mapping(source = "building.id", target = "buildingId")
    @Mapping(source = "building.name", target = "buildingName")
    @Mapping(source = "room.id", target = "roomId")
    @Mapping(source = "room.roomNumber", target = "roomNumber")
    @Mapping(source = "histories", target = "histories")
    PropertyAssetResponse toResponse(PropertyAsset entity);

    PropertyAssetHistoryResponse toHistoryResponse(PropertyAssetHistory entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "boardingHouse", ignore = true)
    @Mapping(target = "building", ignore = true)
    @Mapping(target = "room", ignore = true)
    @Mapping(target = "warrantyExpiry", ignore = true)
    @Mapping(target = "nextMaintenanceDate", ignore = true)
    @Mapping(target = "currentValue", ignore = true)
    @Mapping(target = "histories", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    PropertyAsset toEntity(PropertyAssetRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "boardingHouse", ignore = true)
    @Mapping(target = "building", ignore = true)
    @Mapping(target = "room", ignore = true)
    @Mapping(target = "warrantyExpiry", ignore = true)
    @Mapping(target = "nextMaintenanceDate", ignore = true)
    @Mapping(target = "currentValue", ignore = true)
    @Mapping(target = "histories", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(@MappingTarget PropertyAsset entity, PropertyAssetRequest request);
}
