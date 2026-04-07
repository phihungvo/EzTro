package carevn.luv2code.ez_tro.controller.admin;

import java.util.Date;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.ChartData;
import carevn.luv2code.ez_tro.service.admin.DashboardService;
import lombok.RequiredArgsConstructor;

/**
 * REST Controller cho dữ liệu dashboard (biểu đồ/tổng quan).
 *
 * <p>Các endpoint thường chỉ tổng hợp số liệu và trả về cấu trúc chart.
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;

    /**
     * Lấy dữ liệu biểu đồ nhân sự theo phòng ban (placeholder/demo).
     *
     * @param status trạng thái lọc (tùy nghiệp vụ)
     * @param dateFrom ngày bắt đầu lọc
     * @param dateTo ngày kết thúc lọc
     * @return dữ liệu chart
     */
    @GetMapping("/employees-by-department")
    public ApiResponse<ChartData> getEmployeesByDepartment(
            @RequestParam(required = false, defaultValue = "true") Boolean status,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date dateFrom,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date dateTo) {

        ChartData data = dashboardService.getEmployeesByDepartment(status, dateFrom, dateTo);

        return ApiResponse.<ChartData>builder()
                .message("Lấy dữ liệu thành công")
                .result(data)
                .build();
    }
}
