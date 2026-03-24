package carevn.luv2code.ez_tro.service.admin.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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
import carevn.luv2code.ez_tro.enums.BillStatus;
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
import carevn.luv2code.ez_tro.service.admin.ContractSnapshotService;
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
    private final ContractRepository contractRepository;
    private final ContractMapper contractMapper;
    private final TenantMapper tenantMapper;
    private final BillRepository billRepository;
    private final BillMapper billMapper;
    private final MeterReadingRepository meterReadingRepository;
    private final PropertyAssetRepository propertyAssetRepository;
    private final ContractSnapshotService contractSnapshotService;

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

        resourceLimitService.validateCanCreateRoom(boardingHouse.getOwner().getId());

        Building building = getBuildingOrThrow(request.getBuildingId());
        validateBuildingBelongsToBoardingHouse(building, boardingHouse);
        validateFloorAgainstBuilding(request.getFloorNumber(), building);
        validateRoomNumberUniqueness(building.getId(), request.getRoomNumber(), null);

        List<Utility> utilities = resolveUtilitiesForBoardingHouse(boardingHouse, request.getUtilityIds());

        Room room = roomMapper.toEntity(request);
        room.setBoardingHouse(boardingHouse);
        room.setBuilding(building);
        room.setRoomNumber(resolveRoomNumber(request.getRoomNumber(), building.getId()));
        room.setStatus(resolveRoomStatus(request.getStatus(), false));

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
    @Transactional
    public RoomResponse update(Integer id, RoomRequest request) {
        Room room = getRoomOrThrow(id);
        validateOwnerAccess(room.getBoardingHouse());

        if (request.getBoardingHouseId() != null
                && !room.getBoardingHouse().getId().equals(request.getBoardingHouseId())) {
            throw new AppException(ErrorCode.INVALID_ROOM_FOR_BOARDING_HOUSE);
        }

        if (request.getBuildingId() != null && !room.getBuilding().getId().equals(request.getBuildingId())) {
            throw new AppException(ErrorCode.INVALID_BUILDING_FOR_BOARDING_HOUSE);
        }

        validateFloorAgainstBuilding(request.getFloorNumber(), room.getBuilding());
        validateRoomNumberUniqueness(room.getBuilding().getId(), request.getRoomNumber(), room.getId());

        roomMapper.updateRoomFromRequest(request, room);
        room.setRoomNumber(resolveExistingRoomNumber(request.getRoomNumber(), room.getRoomNumber()));
        room.setStatus(resolveRoomStatus(request.getStatus(), hasEffectiveActiveContract(room)));

        if (request.getUtilityIds() != null) {
            List<Utility> utilities =
                    resolveUtilitiesForBoardingHouse(room.getBoardingHouse(), request.getUtilityIds());
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
    @Transactional
    public void delete(Integer id) {
        Room room = getRoomOrThrow(id);
        validateOwnerAccess(room.getBoardingHouse());
        if ((room.getContracts() != null && !room.getContracts().isEmpty())
                || (room.getBills() != null && !room.getBills().isEmpty())
                || (room.getMeterReadings() != null && !room.getMeterReadings().isEmpty())
                || !propertyAssetRepository
                        .findByRoomIdAndIsDeletedFalse(room.getId())
                        .isEmpty()) {
            throw new AppException(ErrorCode.ROOM_DELETE_NOT_ALLOWED);
        }
        roomRepository.delete(room);
    }

    @Override
    @Transactional(readOnly = true)
    public RoomResponse getById(Integer id) {
        Room room = getRoomOrThrow(id);
        validateOwnerAccess(room.getBoardingHouse());
        return roomMapper.toResponse(room);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getAll() {
        return roomRepository.findAll().stream().map(roomMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getAvailableByStatus(Integer boardingHouseId, RoomStatus status) {
        return roomRepository.findByBoardingHouseIdAndStatus(boardingHouseId, status).stream()
                .map(roomMapper::toResponse)
                .toList();
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
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("price"), minPrice));
        }
        if (maxPrice != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("price"), maxPrice));
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
                ContractSnapshotResponse snapshot =
                        contractSnapshotService.getSnapshot(activeContract.getId(), LocalDate.of(year, month, 1));
                if (snapshot.getCurrentVersion() != null) {
                    dto.setRentPrice(snapshot.getCurrentVersion().getPrice());
                }
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
                        && !c.getStartDate().isAfter(LocalDate.now())
                        && (c.getEndDate() == null || !c.getEndDate().isAfter(LocalDate.now())))
                .max(Comparator.comparing(Contract::getStartDate))
                .orElseThrow(() -> new AppException(ErrorCode.YOU_DO_NOT_HAVE_ACTIVE_CONTRACT));

        dto.setCurrentContract(contractMapper.toResponse(activeContract));
        ContractSnapshotResponse detailSnapshot =
                contractSnapshotService.getSnapshot(activeContract.getId(), LocalDate.of(year, month, 1));
        if (detailSnapshot.getCurrentVersion() != null
                && detailSnapshot.getCurrentVersion().getPrice() != null) {
            dto.setRentPrice(detailSnapshot.getCurrentVersion().getPrice().longValue());
        }
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

    @Override
    @Transactional(readOnly = true)
    public CreatorBillContextResponse getCreatorBillContext(Integer roomId, int month, int year) {
        if (month < 1 || month > 12 || year < 2000 || year > 2100) {
            throw new AppException(ErrorCode.INVALID_PERIOD);
        }

        Room room = roomRepository.findById(roomId).orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        SecurityUtils.SpecificationSafeUser safe = SecurityUtils.safeUser();
        if (!safe.isAdmin() && !room.getBoardingHouse().getOwner().getId().equals(safe.getId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        Contract activeContract = getActiveContract(room);
        if (activeContract == null) {
            throw new AppException(ErrorCode.YOU_DO_NOT_HAVE_ACTIVE_CONTRACT);
        }

        ContractSnapshotResponse snapshot =
                contractSnapshotService.getSnapshot(activeContract.getId(), LocalDate.of(year, month, 1));

        LocalDate periodStart = LocalDate.of(year, month, 1);
        LocalDate periodEnd = periodStart.withDayOfMonth(periodStart.lengthOfMonth());

        List<RoomUtility> activeRoomUtilities = Optional.ofNullable(room.getRoomUtilities()).orElse(List.of()).stream()
                .filter(ru -> ru.getUtility() != null)
                .filter(ru -> ru.getUtility().getIsActive() == null
                        || Boolean.TRUE.equals(ru.getUtility().getIsActive()))
                .filter(ru -> !ru.getStartDate().isAfter(periodEnd))
                .filter(ru -> ru.getEndDate() == null || !ru.getEndDate().isBefore(periodStart))
                .toList();

        List<RoomUtility> usageBasedRoomUtilities = activeRoomUtilities.stream()
                .filter(ru -> ru.getUtility().getType() == ServiceType.USAGE_BASED)
                .toList();

        List<RoomUtility> fixedChargeRoomUtilities = activeRoomUtilities.stream()
                .filter(ru -> ru.getUtility().getType() != ServiceType.USAGE_BASED)
                .toList();

        Map<Integer, MeterReading> readingsInPeriod =
                meterReadingRepository.findByRoomIdAndPeriodMonthAndPeriodYear(roomId, month, year).stream()
                        .filter(r -> r.getUtility() != null && r.getUtility().getId() != null)
                        .collect(Collectors.toMap(r -> r.getUtility().getId(), r -> r, (a, b) -> a));

        List<CreatorBillMeterItemResponse> meterItems = usageBasedRoomUtilities.stream()
                .map(roomUtility -> {
                    Utility utility = roomUtility.getUtility();
                    MeterReading reading = readingsInPeriod.get(utility.getId());
                    BigDecimal prevIndex = BigDecimal.ZERO;
                    BigDecimal currentIndex = null;
                    BigDecimal unitPrice = utility.getUnitPrice();

                    if (reading != null) {
                        if (reading.getPreviousIndex() != null) {
                            prevIndex = reading.getPreviousIndex();
                        }
                        currentIndex = reading.getCurrentIndex();
                        if (reading.getUnitPrice() != null) {
                            unitPrice = reading.getUnitPrice();
                        }
                    } else {
                        Optional<MeterReading> prevOpt =
                                meterReadingRepository.findLatestPrevious(roomId, utility.getId(), year, month);
                        if (prevOpt.isPresent() && prevOpt.get().getCurrentIndex() != null) {
                            prevIndex = prevOpt.get().getCurrentIndex();
                        }
                    }

                    return CreatorBillMeterItemResponse.builder()
                            .utilityId(utility.getId())
                            .utilityName(utility.getName())
                            .unit(utility.getUnit())
                            .previousIndex(prevIndex)
                            .currentIndex(currentIndex)
                            .unitPrice(unitPrice)
                            .build();
                })
                .toList();

        List<CreatorBillUtilityItemResponse> usageBasedItems = usageBasedRoomUtilities.stream()
                .map(ru -> CreatorBillUtilityItemResponse.builder()
                        .id(ru.getUtility().getId())
                        .name(ru.getUtility().getName())
                        .type(
                                ru.getUtility().getType() != null
                                        ? ru.getUtility().getType().name()
                                        : null)
                        .unitPrice(ru.getUtility().getUnitPrice())
                        .unit(ru.getUtility().getUnit())
                        .quantity(ru.getQuantity())
                        .usageAmount(ru.getUsageAmount())
                        .totalAmount(BigDecimal.ZERO)
                        .build())
                .toList();

        List<CreatorBillUtilityItemResponse> fixedChargeItems = fixedChargeRoomUtilities.stream()
                .map(ru -> {
                    Utility utility = ru.getUtility();
                    BigDecimal quantity = BigDecimal.valueOf(
                            Optional.ofNullable(ru.getQuantity()).orElse(1));
                    BigDecimal totalAmount = Optional.ofNullable(utility.getUnitPrice())
                            .orElse(BigDecimal.ZERO)
                            .multiply(quantity);
                    return CreatorBillUtilityItemResponse.builder()
                            .id(utility.getId())
                            .name(utility.getName())
                            .type(utility.getType() != null ? utility.getType().name() : null)
                            .unitPrice(utility.getUnitPrice())
                            .unit(utility.getUnit())
                            .quantity(ru.getQuantity())
                            .usageAmount(ru.getUsageAmount())
                            .totalAmount(totalAmount)
                            .build();
                })
                .toList();

        return CreatorBillContextResponse.builder()
                .roomId(room.getId())
                .roomNumber(room.getRoomNumber())
                .contractId(activeContract.getId())
                .rentPrice(
                        snapshot.getCurrentVersion() != null
                                ? snapshot.getCurrentVersion().getPrice()
                                : activeContract.getRentPrice())
                .usageBasedUtilities(usageBasedItems)
                .fixedChargeUtilities(fixedChargeItems)
                .meterReadings(meterItems)
                .build();
    }

    /**
     * Lấy danh sách tóm tắt phòng theo khu nhà trọ và kỳ thanh toán (tháng/năm).
     * <p>
     * API này trả về thông tin tất cả phòng trong một khu nhà trọ cụ thể,
     * bao gồm trạng thái hiện tại, số người ở, hợp đồng active, thông tin người thuê,
     * và tình trạng hóa đơn trong kỳ tháng/năm được chỉ định.
     * <p>
     * - Chỉ chủ nhà trọ (owner) của khu nhà hoặc admin mới được truy cập.
     * - Dữ liệu hợp đồng được fetch eager qua repository để tránh LazyInitializationException.
     * - Hóa đơn được lọc dựa trên dueDate (không cần field month/year riêng trong entity Bill).
     *
     * @param boardingHouseId ID của khu nhà trọ
     * @param month           Tháng (1-12)
     * @param year            Năm (ví dụ: 2025)
     * @return Danh sách RoomPeriodSummaryResponse chứa thông tin tóm tắt từng phòng
     * @throws AppException Nếu kỳ không hợp lệ, khu nhà không tồn tại, hoặc không có quyền truy cập
     */
    @Transactional
    public List<RoomPeriodSummaryResponse> getRoomsSummaryByBoardingHouseAndPeriod(
            Integer boardingHouseId, Integer month, Integer year) {

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

        List<Room> rooms = roomRepository.findByBoardingHouseIdWithContracts(boardingHouseId);
        LocalDate today = LocalDate.now();

        List<RoomPeriodSummaryResponse> responses = new ArrayList<>();

        for (Room room : rooms) {

            // Lấy danh sách hợp đồng active hiện tại
            List<Contract> activeContracts = new ArrayList<>();

            for (Contract c : room.getContracts()) {
                if (c.getStatus() == ContractStatus.ACTIVE && isActiveContract(c, today)) {
                    activeContracts.add(c);
                }
            }

            long currentOccupants = activeContracts.size();

            // Hợp đồng active mới nhất
            Contract activeContract = null;
            for (Contract c : activeContracts) {
                if (activeContract == null || c.getStartDate().isAfter(activeContract.getStartDate())) {
                    activeContract = c;
                }
            }

            // Kiểm tra có bill trong kỳ không
            //            boolean hasBillThisPeriod = billRepository.existsByRoomIdAndMonthAndYear(room.getId(), month,
            // year);
            Long count = billRepository.countByRoomIdAndMonthAndYear(room.getId(), month, year);
            boolean hasBillThisPeriod = count != null && count > 0;

            String billStatus = null;
            BigDecimal billAmount = null;
            String dueDateStr = null;
            boolean isOverdue = false;

            if (hasBillThisPeriod) {

                List<Bill> billsInPeriod = billRepository.findByRoomAndPeriod(room.getId(), month, year);

                if (!billsInPeriod.isEmpty()) {

                    Bill bill = billsInPeriod.get(0);

                    if (bill.getStatus() != null) {
                        billStatus = bill.getStatus().name();
                    } else {
                        billStatus = "UNKNOWN";
                    }

                    billAmount = bill.getAmount();

                    if (bill.getDueDate() != null) {

                        dueDateStr = bill.getDueDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

                        if (BillStatus.UNPAID.equals(bill.getStatus())
                                && bill.getDueDate().isBefore(today)) {
                            isOverdue = true;
                        }
                    }
                }
            }

            // Thông tin tenant & hợp đồng
            String tenantName = null;
            String tenantPhone = null;
            String contractEndDate = "Vô thời hạn";
            Integer monthsRemaining = null;

            if (activeContract != null) {

                Tenant tenant = activeContract.getTenant();

                if (tenant != null && tenant.getUser() != null) {
                    tenantName = tenant.getUser().getFullName();
                    tenantPhone = tenant.getUser().getPhoneNumber();
                }

                if (activeContract.getEndDate() != null) {

                    LocalDate endDate = activeContract.getEndDate();

                    contractEndDate = endDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

                    long months = ChronoUnit.MONTHS.between(today, endDate);

                    if (months > 0) {
                        monthsRemaining = (int) months;
                    } else {
                        monthsRemaining = 0;
                    }
                }
            }

            // Xác định periodStatus
            String periodStatus;

            if (activeContract == null) {
                periodStatus = "Phòng trống";
            } else if (!hasBillThisPeriod) {
                periodStatus = "Chưa có HĐ";
            } else if (isOverdue) {
                periodStatus = "Quá hạn thanh toán";
            } else if (BillStatus.PAID.name().equals(billStatus)) {
                periodStatus = "Đã thanh toán";
            } else {
                periodStatus = "Đã tạo HĐ";
            }

            RoomPeriodSummaryResponse response = RoomPeriodSummaryResponse.builder()
                    .roomId(room.getId())
                    .roomNumber(room.getRoomNumber())
                    .floorNumber(room.getFloorNumber())
                    .currentOccupants((int) currentOccupants)
                    .roomStatus(room.getStatus().name())
                    .periodStatus(periodStatus)
                    .hasBillThisPeriod(hasBillThisPeriod)
                    .billStatus(billStatus)
                    .billAmount(billAmount)
                    .dueDate(dueDateStr)
                    .tenantName(tenantName)
                    .tenantPhone(tenantPhone)
                    .contractEndDate(contractEndDate)
                    .monthsRemaining(monthsRemaining)
                    .build();

            responses.add(response);
        }

        return responses;
        //        return rooms.stream()
        //                .map(room -> {
        //
        //                    // Lấy danh sách hợp đồng active hiện tại
        //                    List<Contract> activeContracts = room.getContracts().stream()
        //                            .filter(c -> c.getStatus() == ContractStatus.ACTIVE)
        //                            .filter(c -> isActiveContract(c, today))
        //                            .toList();
        //
        //                    long currentOccupants = activeContracts.size();
        //
        //                    // Hợp đồng active mới nhất
        //                    Contract activeContract = activeContracts.stream()
        //                            .max(Comparator.comparing(Contract::getStartDate))
        //                            .orElse(null);
        //
        //                    // Kiểm tra có bill trong kỳ không
        //                    boolean hasBillThisPeriod = billRepository.existsByRoomIdAndMonthAndYear(room.getId(),
        // month, year);
        //
        //                    // Lấy bill mới nhất trong kỳ (nếu có)
        //                    String billStatus = null;
        //                    BigDecimal billAmount = null;
        //                    String dueDateStr = null;
        //                    boolean isOverdue = false;
        //
        //                    if (hasBillThisPeriod) {
        //                        // Lấy bill mới nhất (giả sử đã order by createdAt DESC trong query)
        //                        List<Bill> billsInPeriod = billRepository.findByRoomAndPeriod(room.getId(), month,
        // year);
        //
        //                        if (!billsInPeriod.isEmpty()) {
        //                            Bill bill = billsInPeriod.get(0); // bill mới nhất
        //
        //                            billStatus =
        //                                    bill.getStatus() != null ? bill.getStatus().name() : "UNKNOWN";
        //                            billAmount = bill.getAmount();
        //
        //                            // dueDate đã là LocalDate → không cần convert phức tạp
        //                            if (bill.getDueDate() != null) {
        //                                dueDateStr =
        // bill.getDueDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        //                                isOverdue = BillStatus.UNPAID.equals(bill.getStatus())
        //                                        && bill.getDueDate().isBefore(today);
        //                            }
        //                        }
        //                    }
        //
        //                    // Thông tin tenant & hợp đồng
        //                    String tenantName = null;
        //                    String tenantPhone = null;
        //                    String contractEndDate = "Vô thời hạn";
        //                    Integer monthsRemaining = null;
        //
        //                    if (activeContract != null) {
        //                        Tenant tenant = activeContract.getTenant();
        //                        if (tenant != null && tenant.getUser() != null) {
        //                            tenantName = tenant.getUser().getFullName();
        //                            tenantPhone = tenant.getUser().getPhoneNumber();
        //                        }
        //
        //                        if (activeContract.getEndDate() != null) {
        //                            LocalDate endDate = toLocalDate(activeContract.getEndDate());
        //                            if (endDate != null) {
        //                                contractEndDate = endDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        //
        //                                // Tính số tháng còn lại (chỉ dương)
        //                                long months = ChronoUnit.MONTHS.between(today, endDate);
        //                                monthsRemaining = months > 0 ? (int) months : 0;
        //                            }
        //                        }
        //                    }
        //
        //                    // Xác định periodStatus chi tiết
        //                    String periodStatus;
        //                    if (activeContract == null) {
        //                        periodStatus = "Phòng trống";
        //                    } else if (!hasBillThisPeriod) {
        //                        periodStatus = "Chưa có HĐ";
        //                    } else if (isOverdue) {
        //                        periodStatus = "Quá hạn thanh toán";
        //                    } else if (BillStatus.PAID.name().equals(billStatus)) {
        //                        periodStatus = "Đã thanh toán";
        //                    } else {
        //                        periodStatus = "Đã tạo HĐ";
        //                    }
        //
        //                    return RoomPeriodSummaryResponse.builder()
        //                            .roomId(room.getId())
        //                            .roomNumber(room.getRoomNumber())
        //                            .floorNumber(room.getFloorNumber())
        //                            .currentOccupants((int) currentOccupants)
        //                            .roomStatus(room.getStatus().name())
        //                            .periodStatus(periodStatus)
        //                            .hasBillThisPeriod(hasBillThisPeriod)
        //                            .billStatus(billStatus)
        //                            .billAmount(billAmount)
        //                            .dueDate(dueDateStr) // thêm field này vào DTO nếu cần
        //                            .tenantName(tenantName)
        //                            .tenantPhone(tenantPhone)
        //                            .contractEndDate(contractEndDate)
        //                            .monthsRemaining(monthsRemaining)
        //                            .build();
        //                })
        //                .toList();
    }

    @Override
    public List<RoomResponse> getAllByRole() {
        return getAllRoomsByRole(Pageable.unpaged()).getContent();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getByBoardingHouseId(Integer boardingHouseId) {
        BoardingHouse boardingHouse = getBoardingHouseOrThrow(boardingHouseId);
        validateOwnerAccess(boardingHouse);
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

    private Building getBuildingOrThrow(Integer buildingId) {
        return buildingRepository
                .findById(buildingId)
                .orElseThrow(() -> new AppException(ErrorCode.BUILDING_NOT_FOUND));
    }

    private void validateOwnerAccess(BoardingHouse boardingHouse) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (!SecurityUtils.isAdmin() && !boardingHouse.getOwner().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
    }

    private void validateBuildingBelongsToBoardingHouse(Building building, BoardingHouse boardingHouse) {
        if (!building.getBoardingHouse().getId().equals(boardingHouse.getId())) {
            throw new AppException(ErrorCode.INVALID_BUILDING_FOR_BOARDING_HOUSE);
        }
    }

    private void validateFloorAgainstBuilding(Integer floorNumber, Building building) {
        if (floorNumber == null || building.getTotalFloors() == null) {
            return;
        }

        if (floorNumber > building.getTotalFloors()) {
            throw new AppException(ErrorCode.ROOM_FLOOR_INVALID);
        }
    }

    private void validateRoomNumberUniqueness(Integer buildingId, String roomNumber, Integer excludeRoomId) {
        if (!StringUtils.hasText(roomNumber)) {
            return;
        }

        boolean exists = roomRepository.existsByBuildingIdAndRoomNumber(buildingId, roomNumber.trim());
        if (!exists) {
            return;
        }

        if (excludeRoomId == null) {
            throw new AppException(ErrorCode.ROOM_ALREADY_EXISTS);
        }

        Room existingRoom = roomRepository
                .findByBuildingIdAndRoomNumber(buildingId, roomNumber.trim())
                .orElse(null);
        if (existingRoom != null && !existingRoom.getId().equals(excludeRoomId)) {
            throw new AppException(ErrorCode.ROOM_ALREADY_EXISTS);
        }
    }

    private String resolveRoomNumber(String requestedRoomNumber, Integer buildingId) {
        if (StringUtils.hasText(requestedRoomNumber)) {
            return requestedRoomNumber.trim();
        }

        Integer maxRoomNumber = roomRepository.findMaxRoomNumberByBuildingId(buildingId);
        int nextRoomNumber = (maxRoomNumber == null) ? AppConstants.DEFAULT_ROOM_START_NUMBER : maxRoomNumber + 1;

        while (roomRepository.existsByBuildingIdAndRoomNumber(buildingId, String.valueOf(nextRoomNumber))) {
            nextRoomNumber++;
        }

        return String.valueOf(nextRoomNumber);
    }

    private String resolveExistingRoomNumber(String requestedRoomNumber, String currentRoomNumber) {
        return StringUtils.hasText(requestedRoomNumber) ? requestedRoomNumber.trim() : currentRoomNumber;
    }

    private RoomStatus resolveRoomStatus(RoomStatus requestedStatus, boolean hasActiveContract) {
        if (hasActiveContract) {
            return RoomStatus.OCCUPIED;
        }

        RoomStatus resolvedStatus = requestedStatus == null ? RoomStatus.AVAILABLE : requestedStatus;
        if (resolvedStatus == RoomStatus.OCCUPIED) {
            throw new AppException(ErrorCode.ROOM_STATUS_INVALID);
        }
        return resolvedStatus;
    }

    private boolean hasEffectiveActiveContract(Room room) {
        if (room.getId() == null) {
            return false;
        }
        return contractRepository.existsEffectiveActiveContractByRoomId(room.getId(), LocalDate.now());
    }

    private BoardingHouse getBoardingHouseOrThrow(Integer id) {
        return boardingHouseRepository
                .findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOARDING_HOUSE_NOT_FOUND));
    }

    private List<Utility> resolveUtilitiesForBoardingHouse(BoardingHouse boardingHouse, List<Integer> utilityIds) {
        if (utilityIds == null || utilityIds.isEmpty()) {
            return List.of();
        }

        List<Utility> utilities = utilityRepository.findAllById(utilityIds);
        if (utilities.size() != utilityIds.size()) {
            throw new AppException(ErrorCode.UTILITY_NOT_FOUND);
        }

        boolean hasInvalidUtility = utilities.stream()
                .anyMatch(utility -> utility.getBoardingHouse() == null
                        || !utility.getBoardingHouse().getId().equals(boardingHouse.getId()));
        if (hasInvalidUtility) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        return utilities;
    }

    private Contract getActiveContract(Room room) {
        if (room == null || room.getContracts() == null || room.getContracts().isEmpty()) {
            return null;
        }

        LocalDate today = LocalDate.now();

        Contract latestContract = null;

        for (Contract c : room.getContracts()) {

            if (c.getStatus() != ContractStatus.ACTIVE) {
                continue;
            }

            //            LocalDate startDate =
            //                    c.getStartDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();

            LocalDate startDate = c.getStartDate();

            if (startDate.isAfter(today)) {
                continue;
            }

            if (c.getEndDate() != null) {
                //                LocalDate endDate = c.getEndDate()
                //                        .toInstant()
                //                        .atZone(ZoneId.systemDefault())
                //                        .toLocalDate();
                LocalDate endDate = c.getEndDate();

                if (endDate.isBefore(today)) {
                    continue;
                }
            }

            if (latestContract == null || c.getStartDate().isAfter(latestContract.getStartDate())) {
                latestContract = c;
            }
        }

        return latestContract;

        //        return room.getContracts().stream()
        //                .filter(c -> c.getStatus() == ContractStatus.ACTIVE)
        //                .filter(c -> !c.getStartDate()
        //                        .toInstant()
        //                        .atZone(java.time.ZoneId.systemDefault())
        //                        .toLocalDate()
        //                        .isAfter(today)) // startDate <= today
        //                .filter(c -> c.getEndDate() == null
        //                        || !c.getEndDate()
        //                                .toInstant()
        //                                .atZone(java.time.ZoneId.systemDefault())
        //                                .toLocalDate()
        //                                .isBefore(today))
        //                .max(Comparator.comparing(c -> c.getStartDate().toInstant())) // lấy hợp đồng mới nhất
        //                .orElse(null);
    }

    private boolean isActiveContract(Contract c, LocalDate today) {

        LocalDate startDate = c.getStartDate();
        LocalDate endDate = c.getEndDate();

        if (startDate == null) {
            return false;
        }

        if (today.isBefore(startDate)) {
            return false;
        }

        if (endDate != null && today.isAfter(endDate)) {
            return false;
        }

        return true;
    }

    private LocalDate toLocalDate(Date date) {
        return date == null ? null : new java.sql.Date(date.getTime()).toLocalDate();
    }
}
