package carevn.luv2code.ez_tro.mapper;

import org.mapstruct.*;

import carevn.luv2code.ez_tro.dto.requests.ContractRequest;
import carevn.luv2code.ez_tro.dto.response.ContractResponse;
import carevn.luv2code.ez_tro.entity.Contract;

@Mapper(componentModel = "spring")
public interface ContractMapper {
    @Mapping(source = "room.id", target = "roomId")
    @Mapping(source = "room.roomNumber", target = "roomNumber")
    @Mapping(source = "tenant.id", target = "tenantId")
    @Mapping(source = "tenant.user.id", target = "userId")
    @Mapping(source = "tenant.user.fullName", target = "tenantFullName")
    @Mapping(source = "room.boardingHouse.name", target = "boardingHouseName")
    @Mapping(target = "fileCount", expression = "java(entity.getFiles() != null ? entity.getFiles().size() : 0)")
    ContractResponse toResponse(Contract entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "room", ignore = true)
    @Mapping(target = "tenant", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Contract toEntity(ContractRequest request);
}
