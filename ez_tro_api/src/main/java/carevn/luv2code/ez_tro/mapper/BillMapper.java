package carevn.luv2code.ez_tro.mapper;

import org.mapstruct.*;

import carevn.luv2code.ez_tro.dto.requests.BillRequest;
import carevn.luv2code.ez_tro.dto.response.BillResponse;
import carevn.luv2code.ez_tro.entity.Bill;

@Mapper(componentModel = "spring")
public interface BillMapper {

    @Mapping(source = "tenant.fullName", target = "tenantName")
    @Mapping(source = "contract.id", target = "contractId")
    BillResponse toResponse(Bill bill);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "contract", ignore = true)
    @Mapping(target = "tenant", ignore = true)
    @Mapping(target = "room", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Bill toEntity(BillRequest request);
}
