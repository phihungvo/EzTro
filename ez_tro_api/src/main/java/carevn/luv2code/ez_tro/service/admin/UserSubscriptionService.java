package carevn.luv2code.ez_tro.service.admin;

import carevn.luv2code.ez_tro.dto.UserSubscriptionDTO;
import carevn.luv2code.ez_tro.dto.requests.AssignSubscriptionRequest;
import carevn.luv2code.ez_tro.dto.requests.OverrideLimitsRequest;
import carevn.luv2code.ez_tro.dto.response.OwnerLimitsResponse;

public interface UserSubscriptionService {

    UserSubscriptionDTO assignSubscription(AssignSubscriptionRequest request);

    UserSubscriptionDTO overrideLimits(Long subscriptionId, OverrideLimitsRequest request);

    OwnerLimitsResponse getCurrentLimits(Integer ownerId);
}
