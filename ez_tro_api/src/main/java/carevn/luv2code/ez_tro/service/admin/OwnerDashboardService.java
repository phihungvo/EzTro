package carevn.luv2code.ez_tro.service.admin;

import carevn.luv2code.ez_tro.dto.requests.OwnerDashboardFilterRequest;
import carevn.luv2code.ez_tro.dto.response.OwnerDashboardSummaryResponse;

public interface OwnerDashboardService {
    OwnerDashboardSummaryResponse getSummary(OwnerDashboardFilterRequest filter);
}
