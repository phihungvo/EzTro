package carevn.luv2code.ez_tro.mapper;

import carevn.luv2code.ez_tro.dto.SubscriptionPlanDTO;
import carevn.luv2code.ez_tro.dto.requests.SubscriptionPlanCreateRequest;
import carevn.luv2code.ez_tro.entity.SubscriptionPlan;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface SubscriptionPlanMapper {

    SubscriptionPlanDTO toDTO(SubscriptionPlan entity);

    SubscriptionPlan toEntity(SubscriptionPlanCreateRequest request);

    void updateFromRequest(SubscriptionPlanCreateRequest request, @MappingTarget SubscriptionPlan entity);
}