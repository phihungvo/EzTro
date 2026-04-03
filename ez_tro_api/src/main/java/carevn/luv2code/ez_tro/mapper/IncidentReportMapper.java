package carevn.luv2code.ez_tro.mapper;

import org.mapstruct.*;

import carevn.luv2code.ez_tro.dto.response.IncidentReportResponse;
import carevn.luv2code.ez_tro.entity.IncidentReport;

@Mapper(componentModel = "spring")
public interface IncidentReportMapper {

    @Mapping(target = "tenantId", source = "tenant.id")
    @Mapping(target = "roomId", source = "room.id")
    @Mapping(target = "tenantName", source = "tenant.user.fullName")
    @Mapping(target = "roomNumber", source = "room.roomNumber")
    @Mapping(target = "buildingName", source = "room.building.name")
    @Mapping(target = "boardingHouseName", source = "room.boardingHouse.name")
    @Mapping(target = "resolveNote", source = "resolveNote")
    IncidentReportResponse toResponse(IncidentReport incidentReport);
}
