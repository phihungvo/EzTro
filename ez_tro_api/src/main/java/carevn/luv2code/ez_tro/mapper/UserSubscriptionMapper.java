package carevn.luv2code.ez_tro.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import carevn.luv2code.ez_tro.dto.UserSubscriptionDTO;
import carevn.luv2code.ez_tro.dto.requests.AssignSubscriptionRequest;
import carevn.luv2code.ez_tro.entity.UserSubscription;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface UserSubscriptionMapper {

    @Mapping(target = "ownerId", source = "owner.id")
    @Mapping(target = "ownerName", source = "owner.fullName")
    @Mapping(target = "planId", source = "plan.id")
    @Mapping(target = "planCode", source = "plan.code")
    @Mapping(target = "planName", source = "plan.name")
    UserSubscriptionDTO toDTO(UserSubscription entity);

    UserSubscription toEntity(AssignSubscriptionRequest request);
}
