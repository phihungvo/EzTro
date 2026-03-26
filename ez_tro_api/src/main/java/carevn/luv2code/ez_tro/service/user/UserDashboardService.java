package carevn.luv2code.ez_tro.service.user;

import carevn.luv2code.ez_tro.dto.response.DashboardSummaryResponse;

/**
 * Service contract tổng hợp dữ liệu dashboard phía người thuê.
 */
public interface UserDashboardService {
    DashboardSummaryResponse getTenantSummaryInfoByUserId(Integer userId);
}
