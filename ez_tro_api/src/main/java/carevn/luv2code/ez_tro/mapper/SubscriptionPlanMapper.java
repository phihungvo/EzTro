package carevn.luv2code.ez_tro.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import carevn.luv2code.ez_tro.dto.SubscriptionPlanDTO;
import carevn.luv2code.ez_tro.dto.requests.SubscriptionPlanCreateRequest;
import carevn.luv2code.ez_tro.entity.SubscriptionPlan;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface SubscriptionPlanMapper {

    SubscriptionPlanDTO toDTO(SubscriptionPlan entity);

    SubscriptionPlan toEntity(SubscriptionPlanCreateRequest request);

    void updateFromRequest(SubscriptionPlanCreateRequest request, @MappingTarget SubscriptionPlan entity);
}
