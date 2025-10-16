package carevn.luv2code.ez_tro.mapper;

import org.mapstruct.*;

import carevn.luv2code.ez_tro.dto.requests.ContractRequest;
import carevn.luv2code.ez_tro.dto.response.ContractResponse;
import carevn.luv2code.ez_tro.entity.Contract;

@Mapper(componentModel = "spring")
public interface ContractMapper {
    @Mapping(source = "room.roomNumber", target = "roomNumber")
    @Mapping(source = "tenant.user.fullName", target = "tenantName")
    ContractResponse toResponse(Contract entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "room", ignore = true)
    @Mapping(target = "tenant", ignore = true)
    @Mapping(target = "bills", ignore = true)
    Contract toEntity(ContractRequest request);
}
