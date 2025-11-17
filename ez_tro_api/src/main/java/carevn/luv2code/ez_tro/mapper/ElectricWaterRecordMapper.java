package carevn.luv2code.ez_tro.mapper;

import org.mapstruct.*;

import carevn.luv2code.ez_tro.dto.requests.ElectricWaterRecordRequest;
import carevn.luv2code.ez_tro.dto.response.ElectricWaterRecordResponse;
import carevn.luv2code.ez_tro.entity.ElectricWaterRecord;

@Mapper(componentModel = "spring")
public interface ElectricWaterRecordMapper {
    //    @Mapping(target = "id", ignore = true)
    //    @Mapping(target = "room", ignore = true)
    ElectricWaterRecord toEntity(ElectricWaterRecordRequest request);

    @Mapping(source = "room.id", target = "roomId")
    @Mapping(source = "room.roomNumber", target = "roomNumber")
    @Mapping(source = "room.boardingHouse.name", target = "boardingHouseName")
    ElectricWaterRecordResponse toResponse(ElectricWaterRecord record);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget ElectricWaterRecord entity, ElectricWaterRecordRequest request);
}
