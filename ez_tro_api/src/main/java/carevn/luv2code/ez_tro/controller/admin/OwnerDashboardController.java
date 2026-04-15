package carevn.luv2code.ez_tro.controller.admin;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.OwnerDashboardFilterRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.OwnerDashboardSummaryResponse;
import carevn.luv2code.ez_tro.service.admin.OwnerDashboardService;
import lombok.RequiredArgsConstructor;

/**
 * Dashboard dành cho Owner (chủ trọ).
 * Cho phép lọc theo tuần/tháng/năm hoặc custom range và theo khu nhà (boarding house).
 */
@RestController
@RequestMapping("/api/owner/dashboard")
@RequiredArgsConstructor
public class OwnerDashboardController {

    private final OwnerDashboardService ownerDashboardService;

    @GetMapping("/summary")
    public ApiResponse<OwnerDashboardSummaryResponse> getSummary(
            @RequestParam(required = false) String rangeType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Integer boardingHouseId) {

        OwnerDashboardFilterRequest filter = new OwnerDashboardFilterRequest();
        filter.setRangeType(parseRange(rangeType));
        filter.setStartDate(startDate);
        filter.setEndDate(endDate);
        filter.setBoardingHouseId(boardingHouseId);

        OwnerDashboardSummaryResponse summary = ownerDashboardService.getSummary(filter);
        return ApiResponse.<OwnerDashboardSummaryResponse>builder()
                .message("Lấy dashboard owner thành công")
                .result(summary)
                .build();
    }

    private carevn.luv2code.ez_tro.enums.DashboardRangeType parseRange(String rangeType) {
        if (rangeType == null || rangeType.isBlank()) {
            return null;
        }
        try {
            return carevn.luv2code.ez_tro.enums.DashboardRangeType.valueOf(
                    rangeType.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("rangeType phải là WEEK, MONTH, YEAR hoặc CUSTOM");
        }
    }
}
