package carevn.luv2code.ez_tro.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import carevn.luv2code.ez_tro.dto.requests.TenantCreateRequest;
import carevn.luv2code.ez_tro.dto.requests.TenantRequest;
import carevn.luv2code.ez_tro.dto.response.*;
import carevn.luv2code.ez_tro.entity.Tenant;

@Mapper(componentModel = "spring")
public interface TenantMapper {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.fullName", target = "fullName")
    @Mapping(source = "user.email", target = "email")
    @Mapping(source = "user.phoneNumber", target = "phoneNumber")
    @Mapping(source = "gender", target = "gender")
    TenantResponse toResponse(Tenant tenant);

    @Mapping(source = "user.fullName", target = "fullName")
    @Mapping(source = "user.email", target = "email")
    @Mapping(source = "user.phoneNumber", target = "phoneNumber")
    @Mapping(source = "permanentAddress", target = "permanentAddress")
    @Mapping(target = "issueDate", source = "issueDate")
    @Mapping(target = "issuePlace", source = "issuePlace")
    @Mapping(target = "vehicleInfo", source = "vehicleInfo")
    @Mapping(target = "emergencyContact", source = "emergencyContact")
    @Mapping(target = "emergencyPhone", source = "emergencyPhone")
    @Mapping(target = "profilePictureId", source = "user.profilePicture.id")
    TenantDetailResponse toDetailResponse(Tenant tenant);

    @Mapping(target = "contractCode", ignore = true)
    @Mapping(target = "contractStatus", ignore = true)
    @Mapping(target = "startDate", ignore = true)
    @Mapping(target = "endDate", ignore = true)
    @Mapping(target = "rentPrice", ignore = true)
    @Mapping(target = "deposit", ignore = true)
    @Mapping(target = "moveInDate", ignore = true)
    @Mapping(target = "isContractRepresentative", ignore = true)
    @Mapping(target = "isLiving", ignore = true)
    @Mapping(target = "roomName", ignore = true)
    @Mapping(target = "floorNumber", ignore = true)
    @Mapping(target = "area", ignore = true)
    @Mapping(target = "boardingHouseName", ignore = true)
    @Mapping(target = "boardingHouseAddress", ignore = true)
    CurrentRentalInfoResponse toCurrentRentalInfo(Tenant tenant);

    //    @Mapping(source = "user.fullName", target = "fullName")
    //    @Mapping(source = "user.phoneNumber", target = "phone")
    //    @Mapping(source = "user.email", target = "email")
    //    @Mapping(source = "identityNumber", target = "identityNumber")
    //    TenantBasicResponse toBasicResponse(Tenant tenant);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "contracts", ignore = true)
    Tenant toEntity(TenantRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "vehicleInfo", ignore = true)
    @Mapping(target = "contracts", ignore = true)
    Tenant toEntity(TenantCreateRequest request);
}
