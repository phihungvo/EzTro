package carevn.luv2code.ez_tro.service.admin;

import java.util.List;

import carevn.luv2code.ez_tro.dto.SubscriptionPlanDTO;
import carevn.luv2code.ez_tro.dto.requests.SubscriptionPlanCreateRequest;

/**
 * Service contract quản lý SubscriptionPlan.
 */
public interface SubscriptionPlanService {

    SubscriptionPlanDTO create(SubscriptionPlanCreateRequest request);

    List<SubscriptionPlanDTO> getAllActive();

    SubscriptionPlanDTO getById(Integer id);

    SubscriptionPlanDTO update(Integer id, SubscriptionPlanCreateRequest request);

    void delete(Integer id);
}
