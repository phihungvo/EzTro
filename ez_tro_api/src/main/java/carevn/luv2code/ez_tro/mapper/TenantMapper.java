package carevn.luv2code.ez_tro.mapper;

import org.mapstruct.*;

import carevn.luv2code.ez_tro.dto.requests.TenantRequest;
import carevn.luv2code.ez_tro.dto.response.TenantResponse;
import carevn.luv2code.ez_tro.entity.Tenant;

@Mapper(componentModel = "spring")
public interface TenantMapper {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.fullName", target = "fullName")
    @Mapping(source = "user.email", target = "email")
    @Mapping(source = "user.phoneNumber", target = "phoneNumber")
    @Mapping(source = "gender", target = "gender")
    TenantResponse toResponse(Tenant tenant);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    Tenant toEntity(TenantRequest request);
}
