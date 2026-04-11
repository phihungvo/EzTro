package carevn.luv2code.ez_tro.service.admin.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.requests.OwnerDashboardFilterRequest;
import carevn.luv2code.ez_tro.dto.response.ChartData;
import carevn.luv2code.ez_tro.dto.response.OwnerDashboardSummaryResponse;
import carevn.luv2code.ez_tro.dto.response.Series;
import carevn.luv2code.ez_tro.enums.ContractStatus;
import carevn.luv2code.ez_tro.enums.DashboardRangeType;
import carevn.luv2code.ez_tro.enums.RoomStatus;
import carevn.luv2code.ez_tro.repository.*;
import carevn.luv2code.ez_tro.repository.projection.BoardingHouseOccupancyProjection;
import carevn.luv2code.ez_tro.repository.projection.RevenueBucket;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.OwnerDashboardService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OwnerDashboardServiceImpl implements OwnerDashboardService {

    private final BoardingHouseRepository boardingHouseRepository;
    private final RoomRepository roomRepository;
    private final ContractRepository contractRepository;
    private final PaymentRepository paymentRepository;
    private final BillRepository billRepository;

    @Override
    public OwnerDashboardSummaryResponse getSummary(OwnerDashboardFilterRequest filter) {
        Integer ownerId = SecurityUtils.getCurrentUserIdOrThrow();

        LocalDate today = LocalDate.now();
        LocalDate start;
        LocalDate end; // exclusive

        DashboardRangeType rangeType = filter.getRangeType() != null ? filter.getRangeType() : DashboardRangeType.MONTH;
        switch (rangeType) {
            case WEEK -> {
                start = today.with(java.time.DayOfWeek.MONDAY);
                end = start.plusWeeks(1);
            }
            case YEAR -> {
                start = today.with(TemporalAdjusters.firstDayOfYear());
                end = start.plusYears(1);
            }
            case CUSTOM -> {
                start = filter.getStartDate() != null
                        ? filter.getStartDate()
                        : today.with(TemporalAdjusters.firstDayOfMonth());
                end = filter.getEndDate() != null ? filter.getEndDate().plusDays(1) : start.plusMonths(1);
            }
            case MONTH -> {
                start = today.with(TemporalAdjusters.firstDayOfMonth());
                end = start.plusMonths(1);
            }
            default -> throw new IllegalStateException("Unexpected value: " + rangeType);
        }

        if (!start.isBefore(end)) {
            throw new IllegalArgumentException("Khoảng thời gian lọc không hợp lệ (start phải trước end)");
        }

        Integer boardingHouseId = filter.getBoardingHouseId();

        long totalBoardingHouses = boardingHouseId != null ? 1 : boardingHouseRepository.countByOwnerId(ownerId);
        long totalRooms = boardingHouseId != null
                ? roomRepository.countByOwnerIdAndBoardingHouseId(ownerId, boardingHouseId)
                : roomRepository.countByBoardingHouse_Owner_Id(ownerId);
        long occupiedRooms = boardingHouseId != null
                ? roomRepository.countByOwnerAndBoardingHouseAndStatus(ownerId, boardingHouseId, RoomStatus.OCCUPIED)
                : roomRepository.countByOwnerIdAndStatus(ownerId, RoomStatus.OCCUPIED);
        long vacantRooms = totalRooms - occupiedRooms;

        long activeContracts = boardingHouseId != null
                ? contractRepository.countByOwnerIdAndBoardingHouseIdAndStatus(
                        ownerId, boardingHouseId, ContractStatus.ACTIVE)
                : contractRepository.countByOwnerIdAndStatus(ownerId, ContractStatus.ACTIVE);

        // Revenue in range
        LocalDateTime startDateTime = start.atStartOfDay();
        LocalDateTime endDateTime = end.atStartOfDay();
        List<RevenueBucket> buckets =
                paymentRepository.sumRevenueByDay(ownerId, boardingHouseId, startDateTime, endDateTime);
        BigDecimal revenueInRange =
                buckets.stream().map(RevenueBucket::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        // Outstanding (công nợ) trong range theo due date
        BigDecimal outstanding = billRepository.sumOutstandingByOwnerAndRange(ownerId, boardingHouseId, start, end);
        if (outstanding == null) {
            outstanding = BigDecimal.ZERO;
        }
        BigDecimal overdueOutstanding = billRepository.sumOverdueByOwnerAndRange(ownerId, boardingHouseId, start, end);
        if (overdueOutstanding == null) {
            overdueOutstanding = BigDecimal.ZERO;
        }
        long overdueCount = billRepository.countOverdueBillsByOwnerAndRange(ownerId, boardingHouseId, start, end);

        ChartData revenueTrend = toChart(buckets, start, end);

        List<OwnerDashboardSummaryResponse.OccupancyByHouse> occupancyByHouses =
                roomRepository.aggregateOccupancyByHouse(ownerId, boardingHouseId).stream()
                        .map(this::mapOccupancy)
                        .toList();

        return OwnerDashboardSummaryResponse.builder()
                .totalBoardingHouses(totalBoardingHouses)
                .totalRooms(totalRooms)
                .occupiedRooms(occupiedRooms)
                .vacantRooms(vacantRooms)
                .activeContracts(activeContracts)
                .revenueInRange(revenueInRange)
                .outstandingInRange(outstanding)
                .overdueOutstandingInRange(overdueOutstanding)
                .overdueBillsCount(overdueCount)
                .revenueTrend(revenueTrend)
                .occupancyByHouses(occupancyByHouses)
                .build();
    }

    private OwnerDashboardSummaryResponse.OccupancyByHouse mapOccupancy(BoardingHouseOccupancyProjection p) {
        return OwnerDashboardSummaryResponse.OccupancyByHouse.builder()
                .boardingHouseId(p.getBoardingHouseId())
                .boardingHouseName(p.getBoardingHouseName())
                .totalRooms(p.getTotalRooms())
                .occupiedRooms(p.getOccupiedRooms())
                .build();
    }

    private ChartData toChart(List<RevenueBucket> buckets, LocalDate start, LocalDate endExclusive) {
        List<String> categories = new ArrayList<>();
        List<Long> data = new ArrayList<>();

        // ensure chronological order and fill gaps for smooth chart
        LocalDate cursor = start;
        int i = 0;
        while (cursor.isBefore(endExclusive)) {
            categories.add(cursor.toString());
            BigDecimal amount = BigDecimal.ZERO;
            if (i < buckets.size() && buckets.get(i).getBucketDate().equals(cursor)) {
                amount = buckets.get(i).getTotalAmount();
                i++;
            }
            data.add(amount.longValue());
            cursor = cursor.plusDays(1);
        }

        return ChartData.builder()
                .categories(categories)
                .series(List.of(Series.builder().name("Doanh thu").data(data).build()))
                .build();
    }
}
