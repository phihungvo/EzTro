package carevn.luv2code.ez_tro.dto.requests;

import java.time.LocalDate;

import carevn.luv2code.ez_tro.enums.DashboardRangeType;
import lombok.Data;

@Data
public class OwnerDashboardFilterRequest {
    private DashboardRangeType rangeType;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer boardingHouseId; // null = tất cả
}
