package carevn.luv2code.ez_tro.service.admin;

import java.util.Date;

import carevn.luv2code.ez_tro.dto.response.ChartData;

/**
 * Service contract tổng hợp số liệu dashboard (biểu đồ/tổng quan).
 */
public interface DashboardService {
    ChartData getEmployeesByDepartment(Boolean status, Date dateFrom, Date dateTo);
}
