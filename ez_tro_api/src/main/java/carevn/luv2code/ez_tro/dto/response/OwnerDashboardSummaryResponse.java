package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerDashboardSummaryResponse {

    // Top KPIs
    private long totalBoardingHouses;
    private long totalRooms;
    private long occupiedRooms;
    private long vacantRooms;
    private long activeContracts;

    private BigDecimal revenueInRange; // tổng tiền nhận trong khoảng lọc
    private BigDecimal outstandingInRange; // công nợ chưa thu trong khoảng
    private BigDecimal overdueOutstandingInRange; // công nợ quá hạn trong khoảng
    private long overdueBillsCount; // số hóa đơn quá hạn trong khoảng

    // Chart: doanh thu theo thời gian
    private ChartData revenueTrend;

    // Chart: tỷ lệ phòng trống / đã thuê theo khu
    private List<OccupancyByHouse> occupancyByHouses;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OccupancyByHouse {
        private Integer boardingHouseId;
        private String boardingHouseName;
        private long totalRooms;
        private long occupiedRooms;
    }
}
