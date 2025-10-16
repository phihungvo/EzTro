package carevn.luv2code.ez_tro.mapper;

import org.mapstruct.*;

import carevn.luv2code.ez_tro.dto.requests.BillRequest;
import carevn.luv2code.ez_tro.dto.response.BillResponse;
import carevn.luv2code.ez_tro.entity.Bill;

@Mapper(componentModel = "spring")
public interface BillMapper {
    @Mapping(source = "contract.tenant.user.fullName", target = "tenantName")
    BillResponse toResponse(Bill bill);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "contract", ignore = true)
    Bill toEntity(BillRequest request);
}
