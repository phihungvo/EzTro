package carevn.luv2code.ez_tro.mapper;

import org.mapstruct.*;

import carevn.luv2code.ez_tro.dto.requests.OwnerRequest;
import carevn.luv2code.ez_tro.dto.response.OwnerResponse;
import carevn.luv2code.ez_tro.entity.User;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OwnerMapper {

    @Mapping(target = "fullName", expression = "java(req.getFirstName() + \" \" + req.getLastName())")
    //    @Mapping(target = "isOwner", constant = "true")
    @Mapping(target = "enabled", constant = "true")
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createAt", ignore = true)
    @Mapping(target = "updateAt", ignore = true)
    User toEntity(OwnerRequest req);

    @Mapping(target = "createdAt", source = "createAt", dateFormat = "yyyy-MM-dd HH:mm:ss")
    OwnerResponse toResponse(User user);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget User user, OwnerRequest req);
}
