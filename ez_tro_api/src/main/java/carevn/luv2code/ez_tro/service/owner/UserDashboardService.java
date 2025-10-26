package carevn.luv2code.ez_tro.service.owner;

import carevn.luv2code.ez_tro.dto.response.DashboardSummaryResponse;

public interface UserDashboardService {
    DashboardSummaryResponse getTenantSummaryInfoByUserId(Integer userId);
}
