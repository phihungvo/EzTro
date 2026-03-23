package carevn.luv2code.ez_tro.mapper;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;

import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

import carevn.luv2code.ez_tro.dto.requests.RoomRequest;
import carevn.luv2code.ez_tro.dto.response.*;
import carevn.luv2code.ez_tro.entity.*;
import carevn.luv2code.ez_tro.enums.ContractStatus;
import carevn.luv2code.ez_tro.repository.BillRepository;

@Mapper(
        componentModel = "spring",
        uses = {TenantMapper.class, ContractMapper.class, BillMapper.class})
public abstract class RoomMapper {

    @Autowired
    protected BillRepository billRepository;

    // Map cơ bản cho Room → RoomResponse (danh sách phòng thông thường)
    @Mapping(source = "boardingHouse.id", target = "boardingHouseId")
    @Mapping(source = "boardingHouse.name", target = "boardingHouseName")
    @Mapping(source = "building.id", target = "buildingId")
    @Mapping(source = "building.name", target = "buildingName")
    @Mapping(target = "utilityIds", expression = "java(getUtilityIds(room))")
    @Mapping(target = "tenantName", expression = "java(getTenantName(room))")
    @Mapping(target = "tenantPhone", expression = "java(getTenantPhone(room))")
    @Mapping(target = "startDate", expression = "java(getContractStartDate(room))")
    @Mapping(target = "endDate", expression = "java(getContractEndDate(room))")
    @Mapping(target = "remainingDays", expression = "java(getRemainingDays(room))")
    public abstract RoomResponse toResponse(Room room);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "boardingHouse", ignore = true)
    @Mapping(target = "building", ignore = true)
    @Mapping(target = "contracts", ignore = true)
    //    @Mapping(target = "electricWaterRecords", ignore = true)
    @Mapping(target = "roomUtilities", ignore = true)
    public abstract Room toEntity(RoomRequest request);

    // Map cho danh sách phòng đang cho thuê (API rented-active)
    //    @Mapping(source = "boardingHouse.name", target = "boardingHouseName")
    //    @Mapping(source = "building.name", target = "buildingName")
    //    @Mapping(target = "currentContract", expression = "java(getCurrentContract(room))")
    //    @Mapping(target = "tenant", expression = "java(getTenant(room))")
    //    @Mapping(target = "rentPrice", expression = "java(getRentPrice(room))")
    @Mapping(target = "monthsLeft", expression = "java(getRemainingMonths(room))")
    //    @Mapping(target = "services", expression = "java(getServices(room))")
    public abstract RentedRoomContextResponse toRentedContext(Room room);

    // Map chi tiết khi chọn phòng (API rented-context)
    //    @Mapping(source = "boardingHouse.name", target = "boardingHouseName")
    //    @Mapping(source = "building.name", target = "buildingName")
    //    @Mapping(target = "currentContract", expression = "java(getCurrentContract(room))")
    //    @Mapping(target = "tenant", expression = "java(getTenant(room))")
    //    @Mapping(target = "rentPrice", expression = "java(getRentPrice(room))")
    @Mapping(target = "monthsLeft", expression = "java(getRemainingMonths(room))")
    //    @Mapping(target = "services", expression = "java(getServices(room))")
    //    @Mapping(target = "elecPrev", expression = "java(getElecPrev(room))")
    //    @Mapping(target = "waterPrev", expression = "java(getWaterPrev(room))")
    @Mapping(target = "hasBillThisMonth", ignore = true) // set trong service
    @Mapping(target = "lastBill", ignore = true) // set trong service
    //    @Mapping(target = "paymentHistory", ignore = true) // set trong service
    public abstract RentedRoomDetailResponse toRentedDetail(Room room);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "boardingHouse", ignore = true)
    @Mapping(target = "building", ignore = true)
    @Mapping(target = "roomUtilities", ignore = true)
    public abstract void updateRoomFromRequest(RoomRequest request, @MappingTarget Room room);

    // Helper methods

    protected Contract getActiveContract(Room room) {
        if (room.getContracts() == null || room.getContracts().isEmpty()) {
            return null;
        }

        LocalDate today = LocalDate.now();
        return room.getContracts().stream()
                .filter(c -> c.getStatus() == ContractStatus.ACTIVE
                        && (c.getStartDate() == null || !c.getStartDate().isAfter(today))
                        && (c.getEndDate() == null || !c.getEndDate().isBefore(today)))
                .max(Comparator.comparing(Contract::getStartDate))
                .orElse(null);
    }

    protected String getTenantName(Room room) {
        Contract active = getActiveContract(room);
        return active != null && active.getTenant() != null
                ? active.getTenant().getUser().getFullName()
                : null;
    }

    protected String getTenantPhone(Room room) {
        Contract active = getActiveContract(room);
        return active != null && active.getTenant() != null
                ? active.getTenant().getUser().getPhoneNumber()
                : null;
    }

    protected List<Integer> getUtilityIds(Room room) {
        if (room.getRoomUtilities() == null || room.getRoomUtilities().isEmpty()) {
            return List.of();
        }

        return room.getRoomUtilities().stream()
                .map(RoomUtility::getUtility)
                .filter(java.util.Objects::nonNull)
                .map(Utility::getId)
                .toList();
    }

    /**
     * Tính số tháng còn lại (dùng ChronoUnit.MONTHS)
     * Kết quả là số tháng hoàn chỉnh giữa today và endDate
     */
    protected Integer getRemainingMonths(Room room) {
        Contract active = getActiveContract(room);
        if (active == null || active.getEndDate() == null) {
            return null;
        }

        LocalDate today = LocalDate.now();
        LocalDate end = active.getEndDate();

        if (end.isBefore(today)) {
            return 0;
        }

        return (int) ChronoUnit.MONTHS.between(today, end);
    }

    /**
     * Tính số ngày còn lại chính xác (dùng ChronoUnit.DAYS)
     */
    protected Long getRemainingDays(Room room) {
        Contract active = getActiveContract(room);
        if (active == null || active.getEndDate() == null) {
            return null;
        }

        LocalDate today = LocalDate.now();
        LocalDate end = active.getEndDate();

        if (end.isBefore(today)) {
            return 0L;
        }

        return ChronoUnit.DAYS.between(today, end);
    }

    protected java.util.Date getContractStartDate(Room room) {
        Contract active = getActiveContract(room);
        return active != null && active.getStartDate() != null
                ? java.util.Date.from(active.getStartDate()
                        .atStartOfDay(java.time.ZoneId.systemDefault())
                        .toInstant())
                : null;
    }

    protected java.util.Date getContractEndDate(Room room) {
        Contract active = getActiveContract(room);
        return active != null && active.getEndDate() != null
                ? java.util.Date.from(active.getEndDate()
                        .atStartOfDay(java.time.ZoneId.systemDefault())
                        .toInstant())
                : null;
    }
}
