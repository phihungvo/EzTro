package carevn.luv2code.ez_tro.mapper;

import org.mapstruct.*;

import carevn.luv2code.ez_tro.dto.requests.ElectricWaterRecordRequest;
import carevn.luv2code.ez_tro.dto.response.ElectricWaterRecordResponse;
import carevn.luv2code.ez_tro.entity.ElectricWaterRecord;

@Mapper(componentModel = "spring")
public interface ElectricWaterRecordMapper {
    @Mapping(source = "room.roomNumber", target = "roomNumber")
    ElectricWaterRecordResponse toResponse(ElectricWaterRecord record);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "room", ignore = true)
    ElectricWaterRecord toEntity(ElectricWaterRecordRequest request);
}
