package carevn.luv2code.ez_tro.mapper;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;

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
    @Mapping(source = "boardingHouse.name", target = "boardingHouseName")
    @Mapping(source = "building.name", target = "buildingName")
    //    @Mapping(target = "tenantName", expression = "java(getTenantName(room))")
    //    @Mapping(target = "tenantPhone", expression = "java(getTenantPhone(room))")
    //    @Mapping(target = "remainingDays", expression = "java(getRemainingDays(room))")
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
        if (room.getContracts() == null || room.getContracts().isEmpty()) return null;
        LocalDate today = LocalDate.now();
        return room.getContracts().stream()
                .filter(c -> c.getStatus() == ContractStatus.ACTIVE
                        && !c.getStartDate()
                                .toInstant()
                                .atZone(java.time.ZoneId.systemDefault())
                                .toLocalDate()
                                .isAfter(today)
                        && (c.getEndDate() == null
                                || !c.getEndDate()
                                        .toInstant()
                                        .atZone(java.time.ZoneId.systemDefault())
                                        .toLocalDate()
                                        .isBefore(today)))
                .max(Comparator.comparing(c -> c.getStartDate().toInstant()))
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

    //    protected TenantBasicResponse getTenant(Room room) {
    //        Contract active = getActiveContract(room);
    //        return active != null && active.getTenant() != null ? tenantMapper.toBasicResponse(active.getTenant()) :
    // null;
    //    }
    //
    //    protected ContractResponse getCurrentContract(Room room) {
    //        Contract active = getActiveContract(room);
    //        return active != null ? contractMapper.toResponse(active) : null;
    //    }
    //
    //    protected Long getRentPrice(Room room) {
    //        Contract active = getActiveContract(room);
    //        return active != null ? active.getRentPrice() : null;
    //    }

    protected Integer getRemainingMonths(Room room) {
        Contract active = getActiveContract(room);
        if (active == null || active.getEndDate() == null) return null;
        LocalDate today = LocalDate.now();
        LocalDate end = active.getEndDate()
                .toInstant()
                .atZone(java.time.ZoneId.systemDefault())
                .toLocalDate();
        return (int) ChronoUnit.MONTHS.between(today, end);
    }

    protected Long getRemainingDays(Room room) {
        Contract active = getActiveContract(room);
        if (active == null || active.getEndDate() == null) return null;
        long diff = active.getEndDate().getTime() - new java.util.Date().getTime();
        return diff / (1000 * 60 * 60 * 24);
    }

    protected java.util.Date getContractStartDate(Room room) {
        Contract active = getActiveContract(room);
        return active != null ? active.getStartDate() : null;
    }

    protected java.util.Date getContractEndDate(Room room) {
        Contract active = getActiveContract(room);
        return active != null ? active.getEndDate() : null;
    }

    //    protected List<String> getServices(Room room) {
    //        Contract active = getActiveContract(room);
    //        if (active == null || active.getServices() == null) return List.of();
    //        return active.getServices().stream()
    //                .map(Utility::getName) // hoặc getKey nếu bạn thêm field key vào Utility
    //                .collect(Collectors.toList());
    //    }
    //
    //    protected Integer getElecPrev(Room room) {
    //        // Lấy bill gần nhất của phòng
    //        Optional<Bill> lastBill = billRepository.findTopByRoomIdOrderByYearDescMonthDesc(room.getId());
    //        return lastBill.map(Bill::getElecNew).orElse(0);
    //    }
    //
    //    protected Integer getWaterPrev(Room room) {
    //        Optional<Bill> lastBill = billRepository.findTopByRoomIdOrderByYearDescMonthDesc(room.getId());
    //        return lastBill.map(Bill::getWaterNew).orElse(0);
    //    }
}
