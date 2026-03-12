package carevn.luv2code.ez_tro.service.admin.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import carevn.luv2code.ez_tro.constants.AppConstants;
import carevn.luv2code.ez_tro.dto.requests.RoomRequest;
import carevn.luv2code.ez_tro.dto.response.*;
import carevn.luv2code.ez_tro.entity.*;
import carevn.luv2code.ez_tro.enums.ContractStatus;
import carevn.luv2code.ez_tro.enums.RoomStatus;
import carevn.luv2code.ez_tro.enums.ServiceType;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.BillMapper;
import carevn.luv2code.ez_tro.mapper.ContractMapper;
import carevn.luv2code.ez_tro.mapper.RoomMapper;
import carevn.luv2code.ez_tro.mapper.TenantMapper;
import carevn.luv2code.ez_tro.repository.*;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.RoomService;
import carevn.luv2code.ez_tro.specification.RoomSpecs;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final ResourceLimitServiceImpl resourceLimitService;
    private final RoomRepository roomRepository;
    private final BoardingHouseRepository boardingHouseRepository;
    private final BuildingRepository buildingRepository;
    private final UtilityRepository utilityRepository;
    private final RoomMapper roomMapper;
    private final ContractMapper contractMapper;
    private final TenantMapper tenantMapper;
    private final BillRepository billRepository;
    private final BillMapper billMapper;
    private final MeterReadingRepository meterReadingRepository;

    //    @Override
    //    @Transactional
    //    public RoomResponse create(RoomRequest request) {
    //        BoardingHouse boardingHouse = getBoardingHouseOrThrow(request.getBoardingHouseId());
    //
    //        User currentUser = SecurityUtils.getCurrentUser();
    //        if (!boardingHouse.getOwner().getId().equals(currentUser.getId()) && !currentUser.isAdmin()) {
    //            throw new AppException(ErrorCode.FORBIDDEN);
    //        }
    //
    //        resourceLimitService.validateCanCreateRoom(currentUser.getId());
    //
    //        // phần còn lại giữ nguyên...
    //    }

    /**
     * Tạo mới một phòng trong khu nhà trọ:
     * - Xác thực khu nhà trọ và tòa nhà tồn tại.
     * - Lấy danh sách tiện ích thuộc khu nhà trọ (nếu có).
     * - Tự động sinh số phòng nếu chưa được cung cấp.
     * - Gán các tiện ích mặc định cho phòng mới tạo.
     */
    @Override
    @Transactional
    public RoomResponse create(RoomRequest request) {
        BoardingHouse boardingHouse = getBoardingHouseOrThrow(request.getBoardingHouseId());

        User currentUser = SecurityUtils.getCurrentUser();
        if (!boardingHouse.getOwner().getId().equals(currentUser.getId()) && !SecurityUtils.isAdmin()) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        resourceLimitService.validateCanCreateRoom(currentUser.getId());

        Building building = buildingRepository
                .findById(request.getBuildingId())
                .orElseThrow(() -> new AppException(ErrorCode.BUILDING_NOT_FOUND));

        List<Utility> utilities = utilityRepository.findAllByBoardingHouseId(boardingHouse.getId()).stream()
                .filter(u -> request.getUtilityIds() != null
                        && request.getUtilityIds().contains(u.getId()))
                .toList();

        Room room = roomMapper.toEntity(request);
        room.setBoardingHouse(boardingHouse);
        room.setBuilding(building);
        room.setStatus(RoomStatus.AVAILABLE);

        if (request.getRoomNumber() == null || request.getRoomNumber().trim().isEmpty()) {

            Integer maxRoomNumber = roomRepository.findMaxRoomNumberByBuildingId(building.getId());

            int nextRoomNumber = (maxRoomNumber == null) ? AppConstants.DEFAULT_ROOM_START_NUMBER : maxRoomNumber + 1;

            while (roomRepository.existsByBuildingIdAndRoomNumber(building.getId(), String.valueOf(nextRoomNumber))) {
                nextRoomNumber++;
            }

            room.setRoomNumber(String.valueOf(nextRoomNumber));
        }

        List<RoomUtility> roomUtilities = utilities.stream()
                .map(utility -> RoomUtility.builder()
                        .id(new RoomUtilityId(null, utility.getId()))
                        .room(room)
                        .utility(utility)
                        .quantity(1)
                        .startDate(LocalDate.now())
                        .build())
                .toList();

        room.setRoomUtilities(roomUtilities);

        roomRepository.save(room);

        return roomMapper.toResponse(room);
    }

    /**
     * Cập nhật thông tin phòng theo ID, bao gồm các thuộc tính cơ bản và danh sách tiện ích.
     * Không cho phép thay đổi khu nhà trọ hoặc tòa nhà của phòng.
     */
    @Override
    public RoomResponse update(Integer id, RoomRequest request) {
        Room room = getRoomOrThrow(id);

        roomMapper.updateRoomFromRequest(request, room);

        if (request.getUtilityIds() != null) {
            List<Utility> utilities = utilityRepository.findAllById(request.getUtilityIds());
            List<RoomUtility> newRoomUtilities = utilities.stream()
                    .map(utility -> {
                        RoomUtilityId roomUtilityId = new RoomUtilityId(room.getId(), utility.getId());
                        return RoomUtility.builder()
                                .id(roomUtilityId)
                                .room(room)
                                .utility(utility)
                                .quantity(1)
                                .startDate(LocalDate.now())
                                .build();
                    })
                    .collect(Collectors.toList());

            room.getRoomUtilities().clear();
            room.getRoomUtilities().addAll(newRoomUtilities);
        }

        roomRepository.save(room);
        return roomMapper.toResponse(room);
    }

    @Override
    public void delete(Integer id) {
        Room room = getRoomOrThrow(id);
        roomRepository.delete(room);
    }

    @Override
    public RoomResponse getById(Integer id) {
        return roomMapper.toResponse(getRoomOrThrow(id));
    }

    @Override
    public List<RoomResponse> getAll() {
        return roomRepository.findAll().stream().map(roomMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getAvailableRooms() {
        SecurityUtils.SpecificationSafeUser safe = SecurityUtils.safeUser();

        Specification<Room> spec = Specification.where(RoomSpecs.isAvailable());

        if (!safe.isAdmin()) {
            if (safe.get() == null) {
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }
            spec = spec.and(RoomSpecs.ownedBy(safe.get()));
        }

        return roomRepository.findAll(spec).stream().map(roomMapper::toResponse).toList();
    }

    @Override
    public Page<RoomResponse> getAllRoomsPaged(int page, int size) {
        return roomRepository.findAll(PageRequest.of(page, size)).map(roomMapper::toResponse);
    }

    @Override
    public Page<RoomResponse> getAllRoomsByRole(Pageable pageable) {
        User user = SecurityUtils.getCurrentUser();
        boolean isAdmin = user.getRoles().stream().anyMatch(r -> "ADMIN".equals(r.getName()));

        Specification<Room> spec = Specification.where(RoomSpecs.hasBoardingHouse());

        if (!isAdmin) {
            spec = spec.and(RoomSpecs.ownedBy(user));
        }

        return roomRepository.findAll(spec, pageable).map(roomMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RoomResponse> filterRooms(
            String search,
            String status,
            Integer boardingHouseId,
            Integer minArea,
            Integer maxArea,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Boolean hasActiveContract,
            Pageable pageable) {

        SecurityUtils.SpecificationSafeUser safe = SecurityUtils.safeUser();
        Specification<Room> spec = Specification.where(null);

        // Quyền owner
        if (!safe.isAdmin()) {
            spec = spec.and(RoomSpecs.ownedBy(safe.get()));
        }

        // Search: số phòng, tên nhà trọ, địa chỉ nhà trọ
        if (StringUtils.hasText(search)) {
            String lowerSearch = search.toLowerCase().trim();
            spec = spec.and((root, query, cb) -> {
                Join<Room, BoardingHouse> bhJoin = root.join("boardingHouse", JoinType.LEFT);

                Predicate roomNumberPred = cb.like(cb.lower(root.get("roomNumber")), "%" + lowerSearch + "%");
                Predicate bhNamePred = cb.like(cb.lower(bhJoin.get("name")), "%" + lowerSearch + "%");
                Predicate addressPred = cb.like(cb.lower(bhJoin.get("address")), "%" + lowerSearch + "%");

                // Tìm theo SĐT tenant (chỉ khi phòng có hợp đồng active)
                Join<Room, Contract> contractJoin = root.join("contracts", JoinType.LEFT);
                Join<Contract, Tenant> tenantJoin = contractJoin.join("tenant", JoinType.LEFT);
                Join<Tenant, User> userJoin = tenantJoin.join("user", JoinType.LEFT);

                Predicate phonePred = cb.like(cb.lower(userJoin.get("phoneNumber")), "%" + lowerSearch + "%");

                return cb.or(roomNumberPred, bhNamePred, addressPred, phonePred);
            });
        }

        // Lọc theo trạng thái phòng
        if (StringUtils.hasText(status) && !"ALL".equalsIgnoreCase(status)) {
            try {
                RoomStatus roomStatus = RoomStatus.valueOf(status.toUpperCase());
                spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), roomStatus));
            } catch (IllegalArgumentException e) {
                //                log.warn("Invalid room status filter: {}", status);
            }
        }

        // Lọc theo nhà trọ cụ thể
        if (boardingHouseId != null) {
            spec = spec.and(
                    (root, query, cb) -> cb.equal(root.get("boardingHouse").get("id"), boardingHouseId));
        }

        // Diện tích
        if (minArea != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("area"), minArea));
        }
        if (maxArea != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("area"), maxArea));
        }

        // Giá thuê
        if (minPrice != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("rentPrice"), minPrice));
        }
        if (maxPrice != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("rentPrice"), maxPrice));
        }

        // Phòng đang có hợp đồng hiệu lực
        if (hasActiveContract != null) {
            spec = spec.and((root, query, cb) -> {
                Subquery<Contract> subquery = query.subquery(Contract.class);
                Root<Contract> contractRoot = subquery.from(Contract.class);
                subquery.select(contractRoot);
                Join<Contract, Room> roomJoin = contractRoot.join("room", JoinType.INNER);

                LocalDate today = LocalDate.now();
                Predicate statusPred = cb.equal(contractRoot.get("status"), ContractStatus.ACTIVE);
                Predicate startPred = cb.lessThanOrEqualTo(contractRoot.get("startDate"), today);
                Predicate endPred = cb.or(
                        cb.isNull(contractRoot.get("endDate")),
                        cb.greaterThanOrEqualTo(contractRoot.get("endDate"), today));

                subquery.where(cb.equal(roomJoin.get("id"), root.get("id")), statusPred, startPred, endPred);

                return hasActiveContract ? cb.exists(subquery) : cb.not(cb.exists(subquery));
            });
        }

        Page<Room> pageResult = roomRepository.findAll(spec, pageable);
        return pageResult.map(roomMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RentedRoomContextResponse> getRentedActiveRooms(
            Integer boardingHouseId, Integer floor, int month, int year, Pageable pageable) {

        SecurityUtils.SpecificationSafeUser safe = SecurityUtils.safeUser();
        Specification<Room> spec = Specification.where(null);

        // 1. Quyền: chỉ lấy phòng của chủ trọ hiện tại
        if (!safe.isAdmin()) {
            spec = spec.and(RoomSpecs.ownedBy(safe.get()));
        }

        // 2. Chỉ lấy phòng đang cho thuê (có hợp đồng active)
        spec = spec.and((root, query, cb) -> {
            Join<Room, Contract> contractJoin = root.join("contracts", JoinType.INNER);
            LocalDate today = LocalDate.now();

            Predicate activeStatus = cb.equal(contractJoin.get("status"), ContractStatus.ACTIVE);
            Predicate startValid = cb.lessThanOrEqualTo(contractJoin.get("startDate"), today);
            Predicate endValid = cb.or(
                    cb.isNull(contractJoin.get("endDate")),
                    cb.greaterThanOrEqualTo(contractJoin.get("endDate"), today));

            return cb.and(activeStatus, startValid, endValid);
        });

        // 3. Lọc theo khu nhà trọ (boarding house)
        if (boardingHouseId != null) {
            spec = spec.and(
                    (root, query, cb) -> cb.equal(root.get("boardingHouse").get("id"), boardingHouseId));
        }

        // 4. Lọc theo tầng (nếu có)
        if (floor != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("floorNumber"), floor));
        }

        // 5. Thực hiện query
        Page<Room> roomsPage = roomRepository.findAll(spec, pageable);

        // 6. Map sang DTO, thêm thông tin cần thiết
        return roomsPage.map(room -> {
            RentedRoomContextResponse dto = roomMapper.toRentedContext(room);

            // Lấy hợp đồng active mới nhất
            //            Contract activeContract = room.getContracts().stream()
            //                    .filter(c -> c.getStatus() == ContractStatus.ACTIVE
            //                            && !c.getStartDate().after(new Date()))
            //                            && (c.getEndDate() == null || !c.getEndDate().isBefore(LocalDate.now())))
            //                    .max(Comparator.comparing(Contract::getStartDate))
            //                    .orElse(null);
            Contract activeContract = getActiveContract(room);

            if (activeContract != null) {
                dto.setCurrentContract(contractMapper.toResponse(activeContract));
                //                dto.setTenant(tenantMapper.toBasicResponse(activeContract.getTenant()));
                dto.setRentPrice(activeContract.getRentPrice());
                //                dto.setMonthsLeft(calculateMonthsLeft(activeContract));
                //                dto.setServices(activeContract.getServices().stream()
                //                        .map(Service::getKey)
                //                        .collect(Collectors.toList()));

                // Lấy danh sách Utility USAGE_BASED từ hợp đồng hoặc khu nhà
                List<Utility> usageUtilities = room.getRoomUtilities().stream()
                        .map(RoomUtility::getUtility)
                        .filter(u -> u.getType() == ServiceType.USAGE_BASED)
                        .toList();

                dto.setUsageBasedServices(usageUtilities.stream()
                        .map(u -> u.getName()) // hoặc map sang DTO nhỏ nếu cần
                        .collect(Collectors.toList()));
            }

            List<MeterReadingPrevDTO> prevReadings =
                    meterReadingRepository.findLatestByRoomAndPeriod(room.getId(), month, year).stream()
                            .map(mr -> MeterReadingPrevDTO.builder()
                                    .utilityName(mr.getUtility().getName())
                                    .previousIndex(mr.getCurrentIndex().intValue())
                                    .build())
                            .collect(Collectors.toList());

            dto.setPrevMeterReadings(prevReadings);

            // Lấy chỉ số cũ từ bill gần nhất (trước tháng/năm chỉ định)
            //            Optional<Bill> lastBill =
            // billRepository.findTopByRoomIdAndYearLessThanEqualAndMonthLessThanEqualOrderByYearDescMonthDesc(
            //                    room.getId(), year, month);

            //            if (lastBill != null) {
            //                dto.setElecPrev(lastBill.getElecNew());
            //                dto.setWaterPrev(lastBill.getWaterNew());
            //                dto.setLastBill(billMapper.toBasic(lastBill));
            //            } else {
            //                dto.setElecPrev(0);
            //                dto.setWaterPrev(0);
            //            }

            // Kiểm tra đã có bill trong tháng/năm này chưa (để cảnh báo)
            boolean hasBillThisMonth = billRepository.existsByRoomIdAndMonthAndYear(room.getId(), month, year);
            dto.setHasBillThisMonth(hasBillThisMonth);

            return dto;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public RentedRoomDetailResponse getRentedRoomDetail(Integer roomId, int month, int year) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        // Quyền owner
        SecurityUtils.SpecificationSafeUser safe = SecurityUtils.safeUser();
        if (!safe.isAdmin() && !room.getBoardingHouse().getOwner().getId().equals(safe.getId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        RentedRoomDetailResponse dto = roomMapper.toRentedDetail(room);

        // Hợp đồng active hiện tại
        Contract activeContract = room.getContracts().stream()
                .filter(c -> c.getStatus() == ContractStatus.ACTIVE
                        && !c.getStartDate().after(new Date())
                        && (c.getEndDate() == null || !c.getEndDate().before(new Date())))
                .max(Comparator.comparing(Contract::getStartDate))
                .orElseThrow(() -> new AppException(ErrorCode.YOU_DO_NOT_HAVE_ACTIVE_CONTRACT));

        dto.setCurrentContract(contractMapper.toResponse(activeContract));
        //        dto.setTenant(tenantMapper.toBasicResponse(activeContract.getTenant()));
        //        dto.setRentPrice(activeContract.getRentPrice());
        //        dto.setMonthsLeft(calculateMonthsLeft(activeContract));
        //        dto.setServices(activeContract.getServices().stream()
        //                .map(Service::getKey)
        //                .collect(Collectors.toList()));

        // Chỉ số cũ từ bill gần nhất
        //        Optional<Bill> lastBill =
        //                billRepository.findTopByRoomIdAndDueDateBeforeOrderByDueDateDesc(
        //                        roomId, year, month);

        List<MeterReadingPrevDTO> prevReadings =
                meterReadingRepository.findLatestByRoomAndPeriod(room.getId(), month, year).stream()
                        .map(mr -> MeterReadingPrevDTO.builder()
                                .utilityName(mr.getUtility().getName())
                                .previousIndex(mr.getCurrentIndex().intValue())
                                .unit(mr.getUtility().getUnit())
                                .build())
                        .collect(Collectors.toList());
        dto.setPrevMeterReadings(prevReadings);

        //        if (lastBill != null) {
        //            dto.setElecPrev(lastBill.getElecNew());
        //            dto.setWaterPrev(lastBill.getWaterNew());
        //            dto.setLastBill(billMapper.toBasic(lastBill));
        //        } else {
        //            dto.setElecPrev(0);
        //            dto.setWaterPrev(0);
        //        }

        // Đã có bill tháng này chưa
        boolean hasBillThisMonth = billRepository.existsByRoomIdAndMonthAndYear(roomId, month, year);
        dto.setHasBillThisMonth(hasBillThisMonth);

        // Lịch sử thanh toán gần đây (3 bản ghi)
        //        List<PaymentHistoryResponse> history =
        // paymentHistoryRepository.findTop3ByRoomIdOrderByPaymentDateDesc(roomId)
        //                .stream()
        //                .map(paymentMapper::toHistoryResponse)
        //                .collect(Collectors.toList());
        //        dto.setPaymentHistory(history);

        return dto;
    }

    @Transactional(readOnly = true)
    public List<RoomPeriodSummaryResponse> getRoomsSummaryByBoardingHouseAndPeriod(
            Integer boardingHouseId,
            Integer month, // 1-12
            Integer year) {

        // Validate input
        if (month < 1 || month > 12 || year < 2000 || year > 2100) {
            throw new AppException(ErrorCode.INVALID_PERIOD);
        }

        // Kiểm tra quyền
        SecurityUtils.SpecificationSafeUser safe = SecurityUtils.safeUser();
        if (!safe.isAdmin()) {
            BoardingHouse bh = boardingHouseRepository
                    .findById(boardingHouseId)
                    .orElseThrow(() -> new AppException(ErrorCode.BOARDING_HOUSE_NOT_FOUND));
            if (!bh.getOwner().getId().equals(safe.getId())) {
                throw new AppException(ErrorCode.ACCESS_DENIED);
            }
        }

        // Lấy tất cả phòng của boarding house (kể cả phòng trống)
        List<Room> rooms = roomRepository.findByBoardingHouseId(boardingHouseId);

        // Ngày hiện tại để so sánh
        LocalDate today = LocalDate.now();

        return rooms.stream()
                .map(room -> {

                    // 1. Số người ở hiện tại (tính đến thời điểm hiện tại)
                    long currentOccupants = room.getContracts().stream()
                            .filter(c -> c.getStatus() == ContractStatus.ACTIVE)
                            .filter(c -> !today.isBefore(c.getStartDate()
                                    .toInstant()
                                    .atZone(java.time.ZoneId.systemDefault())
                                    .toLocalDate()))
                            .filter(c -> c.getEndDate() == null
                                    || !today.isAfter(c.getEndDate()
                                            .toInstant()
                                            .atZone(java.time.ZoneId.systemDefault())
                                            .toLocalDate()))
                            .count();

                    // 2. Tìm hợp đồng active hiện tại
                    Contract activeContract = room.getContracts().stream()
                            .filter(c -> c.getStatus() == ContractStatus.ACTIVE)
                            .filter(c -> !today.isBefore(c.getStartDate()
                                    .toInstant()
                                    .atZone(java.time.ZoneId.systemDefault())
                                    .toLocalDate()))
                            .filter(c -> c.getEndDate() == null
                                    || !today.isAfter(c.getEndDate()
                                            .toInstant()
                                            .atZone(java.time.ZoneId.systemDefault())
                                            .toLocalDate()))
                            .max(Comparator.comparing(Contract::getStartDate))
                            .orElse(null);

                    // 3. Kiểm tra bill trong kỳ (tháng/năm)
                    boolean hasBillThisPeriod = billRepository.existsByRoomIdAndMonthAndYear(room.getId(), month, year);

                    Bill latestBill = null;
                    if (hasBillThisPeriod) {
                        // Nếu cần lấy thông tin bill chi tiết (status, amount, ...)
                        // Bạn có thể thêm method findFirst... như mình gợi ý trước đó
                        // Hiện tại giả sử chỉ cần biết có/không, nếu cần thì thêm sau
                        // latestBill = billRepository.findFirstBy... (tùy chọn)
                    }

                    // 4. Xác định periodStatus
                    String periodStatus;
                    if (activeContract == null) {
                        periodStatus = "Phòng trống";
                    } else if (!hasBillThisPeriod) {
                        periodStatus = "Chưa có HĐ";
                    } else {
                        // Nếu có bill → mặc định "Đã tạo HĐ"
                        // Nếu bạn muốn phân biệt "Đã thanh toán" hoặc "Quá hạn"
                        // cần lấy latestBill → tạm thời comment phần quá hạn như code gốc
                        periodStatus = "Đã tạo HĐ";
                    }

                    return RoomPeriodSummaryResponse.builder()
                            .roomId(room.getId())
                            .roomNumber(room.getRoomNumber())
                            .floorNumber(room.getFloorNumber())
                            .currentOccupants((int) currentOccupants)
                            .roomStatus(room.getStatus().name())
                            .periodStatus(periodStatus)
                            .hasBillThisPeriod(hasBillThisPeriod)
                            .billStatus(null) // nếu không lấy bill chi tiết thì để null
                            .billAmount(null) // nếu không lấy bill chi tiết thì để null
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<RoomResponse> getAllByRole() {
        return getAllRoomsByRole(Pageable.unpaged()).getContent();
    }

    @Override
    public List<RoomResponse> getByBoardingHouseId(Integer boardingHouseId) {
        return roomRepository.findByBoardingHouseId(boardingHouseId).stream()
                .map(roomMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getByBuildingId(Integer buildingId) {
        Building building = buildingRepository
                .findById(buildingId)
                .orElseThrow(() -> new AppException(ErrorCode.BUILDING_NOT_FOUND));

        SecurityUtils.SpecificationSafeUser safe = SecurityUtils.safeUser();
        if (!safe.isAdmin() && !building.getBoardingHouse().getOwner().getId().equals(safe.getId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        Specification<Room> spec =
                Specification.where(RoomSpecs.hasBoardingHouse()).and(RoomSpecs.inBuilding(buildingId));
        if (!safe.isAdmin()) {
            spec = spec.and(RoomSpecs.ownedBy(safe.get()));
        }

        return roomRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "roomNumber")).stream()
                .map(roomMapper::toResponse)
                .toList();
    }

    /**
     * -------------------- PRIVATE UTILITY METHODS --------------------
     */
    private Room getRoomOrThrow(Integer id) {
        return roomRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
    }

    private BoardingHouse getBoardingHouseOrThrow(Integer id) {
        return boardingHouseRepository
                .findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOARDING_HOUSE_NOT_FOUND));
    }

    private Contract getActiveContract(Room room) {
        if (room == null || room.getContracts() == null || room.getContracts().isEmpty()) {
            return null;
        }

        LocalDate today = LocalDate.now();

        return room.getContracts().stream()
                .filter(c -> c.getStatus() == ContractStatus.ACTIVE)
                .filter(c -> !c.getStartDate()
                        .toInstant()
                        .atZone(java.time.ZoneId.systemDefault())
                        .toLocalDate()
                        .isAfter(today)) // startDate <= today
                .filter(c -> c.getEndDate() == null
                        || !c.getEndDate()
                                .toInstant()
                                .atZone(java.time.ZoneId.systemDefault())
                                .toLocalDate()
                                .isBefore(today))
                .max(Comparator.comparing(c -> c.getStartDate().toInstant())) // lấy hợp đồng mới nhất
                .orElse(null);
    }
}
