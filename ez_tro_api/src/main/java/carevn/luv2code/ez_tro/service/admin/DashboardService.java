package carevn.luv2code.ez_tro.service.admin;

import java.util.Date;

import carevn.luv2code.ez_tro.dto.response.ChartData;

public interface DashboardService {
    ChartData getEmployeesByDepartment(Boolean status, Date dateFrom, Date dateTo);
}
