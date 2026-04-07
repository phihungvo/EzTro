package carevn.luv2code.ez_tro.mapper;

import java.util.List;

import org.mapstruct.*;

import carevn.luv2code.ez_tro.dto.requests.MeterReadingRequest;
import carevn.luv2code.ez_tro.dto.response.MeterReadingResponse;
import carevn.luv2code.ez_tro.entity.MeterReading;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MeterReadingMapper {

    @Mapping(target = "consumption", ignore = true)
    @Mapping(target = "amount", ignore = true)
    MeterReading toEntity(MeterReadingRequest request);

    @Mapping(target = "roomNumber", source = "room.roomNumber")
    @Mapping(target = "utilityName", source = "utility.name")
    @Mapping(target = "utilityUnit", source = "utility.unit")
    MeterReadingResponse toResponse(MeterReading entity);

    List<MeterReadingResponse> toResponseList(List<MeterReading> entities);
}
