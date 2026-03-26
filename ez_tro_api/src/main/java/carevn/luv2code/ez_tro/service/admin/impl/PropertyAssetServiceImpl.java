package carevn.luv2code.ez_tro.service.admin.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import carevn.luv2code.ez_tro.dto.requests.PropertyAssetRequest;
import carevn.luv2code.ez_tro.dto.response.PropertyAssetResponse;
import carevn.luv2code.ez_tro.entity.*;
import carevn.luv2code.ez_tro.enums.*;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.PropertyAssetMapper;
import carevn.luv2code.ez_tro.repository.*;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.PropertyAssetService;
import carevn.luv2code.ez_tro.specification.PropertyAssetSpecs;
import lombok.RequiredArgsConstructor;

/**
 * Service quản lý tài sản (PropertyAsset) thuộc khu nhà trọ/phòng.
 *
 * <p>Service hỗ trợ CRUD + filter và ghi lịch sử thay đổi tài sản (PropertyAssetHistory):
 * tạo mới, cập nhật, bàn giao/di chuyển, thanh lý...
 *
 * <p>Quyền truy cập: admin hoặc owner của khu nhà trọ liên quan.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class PropertyAssetServiceImpl implements PropertyAssetService {

    private final PropertyAssetRepository propertyAssetRepository;
    private final PropertyAssetHistoryRepository propertyAssetHistoryRepository;
    private final BoardingHouseRepository boardingHouseRepository;
    private final BuildingRepository buildingRepository;
    private final RoomRepository roomRepository;
    private final PropertyAssetMapper propertyAssetMapper;

    /**
     * Tạo mới tài sản.
     *
     * <p>Luồng:
     * <ul>
     *   <li>Validate uniqueness (assetCode/serialNumber).</li>
     *   <li>Resolve boarding house/building/room và kiểm tra quyền.</li>
     *   <li>Tính các field dẫn xuất (status/condition/warranty/maintenance/value...).</li>
     *   <li>Ghi history khởi tạo.</li>
     * </ul>
     *
     * @param request payload tạo tài sản
     * @return DTO tài sản sau khi tạo
     */
    @Override
    public PropertyAssetResponse create(PropertyAssetRequest request) {
        validateCreateUniqueness(request);

        BoardingHouse boardingHouse = getBoardingHouseOrThrow(request.getBoardingHouseId());
        validateAccess(boardingHouse);

        Building building = resolveBuilding(request.getBuildingId(), boardingHouse.getId());
        Room room = resolveRoom(request.getRoomId(), boardingHouse.getId());
        if (room != null) {
            building = room.getBuilding();
        }

        PropertyAsset asset = propertyAssetMapper.toEntity(request);
        asset.setBoardingHouse(boardingHouse);
        asset.setBuilding(building);
        asset.setRoom(room);
        applyDerivedFields(asset, request);

        if (asset.getHistories() == null) {
            asset.setHistories(new ArrayList<>());
        }

        propertyAssetRepository.save(asset);
        createInitialHistory(asset);

        return propertyAssetMapper.toResponse(getEntityOrThrow(asset.getId()));
    }

    /**
     * Cập nhật tài sản theo id và ghi history thay đổi.
     *
     * @param id id tài sản
     * @param request payload cập nhật
     * @return DTO tài sản sau khi cập nhật
     */
    @Override
    public PropertyAssetResponse update(Integer id, PropertyAssetRequest request) {
        PropertyAsset asset = getEntityOrThrow(id);
        validateUpdateUniqueness(id, request);
        validateAccess(asset.getBoardingHouse());

        Integer previousRoomId = asset.getRoom() != null ? asset.getRoom().getId() : null;
        PropertyAssetStatus previousStatus = asset.getStatus();

        BoardingHouse boardingHouse = getBoardingHouseOrThrow(request.getBoardingHouseId());
        validateAccess(boardingHouse);

        Building building = resolveBuilding(request.getBuildingId(), boardingHouse.getId());
        Room room = resolveRoom(request.getRoomId(), boardingHouse.getId());
        if (room != null) {
            building = room.getBuilding();
        }

        propertyAssetMapper.updateEntity(asset, request);
        asset.setBoardingHouse(boardingHouse);
        asset.setBuilding(building);
        asset.setRoom(room);
        applyDerivedFields(asset, request);

        propertyAssetRepository.save(asset);
        appendUpdateHistory(asset, previousRoomId, previousStatus);

        return propertyAssetMapper.toResponse(getEntityOrThrow(asset.getId()));
    }

    /**
     * Soft delete tài sản: đánh dấu isDeleted và set status DISPOSED, đồng thời ghi history.
     *
     * @param id id tài sản
     */
    @Override
    public void delete(Integer id) {
        PropertyAsset asset = getEntityOrThrow(id);
        validateAccess(asset.getBoardingHouse());

        asset.setIsDeleted(true);
        asset.setStatus(PropertyAssetStatus.DISPOSED);
        propertyAssetRepository.save(asset);

        recordHistory(asset, PropertyAssetAction.DISPOSAL, "Đánh dấu tài sản đã thanh lý/ngừng sử dụng");
    }

    /**
     * Lấy tài sản theo id.
     *
     * @param id id tài sản
     * @return DTO tài sản
     */
    @Override
    @Transactional(readOnly = true)
    public PropertyAssetResponse getById(Integer id) {
        return propertyAssetMapper.toResponse(getEntityOrThrow(id));
    }

    /**
     * Lấy danh sách tài sản theo role hiện tại (admin: tất cả, owner: của mình).
     *
     * @return danh sách DTO tài sản
     */
    @Override
    @Transactional(readOnly = true)
    public List<PropertyAssetResponse> getAllByRole() {
        SecurityUtils.SpecificationSafeUser safe = SecurityUtils.safeUser();
        Specification<PropertyAsset> spec = Specification.where(PropertyAssetSpecs.notDeleted());

        if (!safe.isAdmin()) {
            if (!safe.isPresent()) {
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }
            spec = spec.and(PropertyAssetSpecs.ownedBy(safe.get()));
        }

        return propertyAssetRepository.findAll(spec).stream()
                .map(propertyAssetMapper::toResponse)
                .toList();
    }

    /**
     * Lấy danh sách tài sản theo phòng.
     *
     * @param roomId id phòng
     * @return danh sách DTO tài sản
     */
    @Override
    @Transactional(readOnly = true)
    public List<PropertyAssetResponse> getByRoomId(Integer roomId) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        validateAccess(room.getBoardingHouse());

        return propertyAssetRepository.findByRoomIdAndIsDeletedFalse(roomId).stream()
                .map(propertyAssetMapper::toResponse)
                .toList();
    }

    /**
     * Lọc tài sản theo nhiều tiêu chí và phân trang.
     *
     * @param search từ khóa
     * @param category danh mục
     * @param status trạng thái
     * @param condition tình trạng
     * @param boardingHouseId id khu nhà trọ
     * @param roomId id phòng
     * @param pageable phân trang/sort
     * @return page tài sản DTO
     */
    @Override
    @Transactional(readOnly = true)
    public Page<PropertyAssetResponse> filter(
            String search,
            PropertyAssetCategory category,
            PropertyAssetStatus status,
            PropertyAssetCondition condition,
            Integer boardingHouseId,
            Integer roomId,
            Pageable pageable) {

        SecurityUtils.SpecificationSafeUser safe = SecurityUtils.safeUser();
        Specification<PropertyAsset> spec = Specification.where(PropertyAssetSpecs.notDeleted())
                .and(PropertyAssetSpecs.search(search))
                .and(PropertyAssetSpecs.category(category))
                .and(PropertyAssetSpecs.status(status))
                .and(PropertyAssetSpecs.condition(condition))
                .and(PropertyAssetSpecs.boardingHouseId(boardingHouseId))
                .and(PropertyAssetSpecs.roomId(roomId));

        if (!safe.isAdmin()) {
            if (!safe.isPresent()) {
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }
            spec = spec.and(PropertyAssetSpecs.ownedBy(safe.get()));
        }

        return propertyAssetRepository.findAll(spec, pageable).map(propertyAssetMapper::toResponse);
    }

    private void validateCreateUniqueness(PropertyAssetRequest request) {
        if (propertyAssetRepository.existsByAssetCodeIgnoreCaseAndIsDeletedFalse(
                request.getAssetCode().trim())) {
            throw new AppException(ErrorCode.PROPERTY_ASSET_CODE_ALREADY_EXISTS);
        }

        if (StringUtils.hasText(request.getSerialNumber())
                && propertyAssetRepository.existsBySerialNumberIgnoreCaseAndIsDeletedFalse(
                        request.getSerialNumber().trim())) {
            throw new AppException(ErrorCode.PROPERTY_ASSET_SERIAL_ALREADY_EXISTS);
        }
    }

    private void validateUpdateUniqueness(Integer id, PropertyAssetRequest request) {
        if (propertyAssetRepository.existsByAssetCodeIgnoreCaseAndIdNotAndIsDeletedFalse(
                request.getAssetCode().trim(), id)) {
            throw new AppException(ErrorCode.PROPERTY_ASSET_CODE_ALREADY_EXISTS);
        }

        if (StringUtils.hasText(request.getSerialNumber())
                && propertyAssetRepository.existsBySerialNumberIgnoreCaseAndIdNotAndIsDeletedFalse(
                        request.getSerialNumber().trim(), id)) {
            throw new AppException(ErrorCode.PROPERTY_ASSET_SERIAL_ALREADY_EXISTS);
        }
    }

    private BoardingHouse getBoardingHouseOrThrow(Integer id) {
        return boardingHouseRepository
                .findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOARDING_HOUSE_NOT_FOUND));
    }

    private Building resolveBuilding(Integer buildingId, Integer boardingHouseId) {
        if (buildingId == null) {
            return null;
        }

        Building building = buildingRepository
                .findById(buildingId)
                .orElseThrow(() -> new AppException(ErrorCode.BUILDING_NOT_FOUND));

        if (!building.getBoardingHouse().getId().equals(boardingHouseId)) {
            throw new AppException(ErrorCode.INVALID_BUILDING_FOR_BOARDING_HOUSE);
        }

        return building;
    }

    private Room resolveRoom(Integer roomId, Integer boardingHouseId) {
        if (roomId == null) {
            return null;
        }

        Room room = roomRepository.findById(roomId).orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        if (!room.getBoardingHouse().getId().equals(boardingHouseId)) {
            throw new AppException(ErrorCode.INVALID_ROOM_FOR_BOARDING_HOUSE);
        }

        return room;
    }

    private void validateAccess(BoardingHouse boardingHouse) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        if (!SecurityUtils.isAdmin() && !boardingHouse.getOwner().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
    }

    private PropertyAsset getEntityOrThrow(Integer id) {
        return propertyAssetRepository
                .findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_ASSET_NOT_FOUND));
    }

    private void applyDerivedFields(PropertyAsset asset, PropertyAssetRequest request) {
        asset.setStatus(
                request.getStatus() != null
                        ? request.getStatus()
                        : (request.getRoomId() != null ? PropertyAssetStatus.ACTIVE : PropertyAssetStatus.STORED));

        asset.setCondition(request.getCondition() != null ? request.getCondition() : PropertyAssetCondition.GOOD);

        asset.setAssetCode(request.getAssetCode().trim());
        asset.setAssetName(request.getAssetName().trim());
        asset.setSerialNumber(
                StringUtils.hasText(request.getSerialNumber())
                        ? request.getSerialNumber().trim()
                        : null);
        asset.setSpecification(normalizeText(asset.getSpecification()));
        asset.setBrand(normalizeText(asset.getBrand()));
        asset.setModel(normalizeText(asset.getModel()));
        asset.setSupplier(normalizeText(asset.getSupplier()));
        asset.setSupplierPhone(normalizeText(asset.getSupplierPhone()));
        asset.setNotes(normalizeText(asset.getNotes()));
        asset.setAssignedTo(normalizeText(asset.getAssignedTo()));
        asset.setIsDeleted(false);

        if (asset.getAssignedDate() == null && asset.getRoom() != null) {
            asset.setAssignedDate(request.getInstallDate() != null ? request.getInstallDate() : LocalDate.now());
        }

        if (!StringUtils.hasText(asset.getAssignedTo()) && asset.getRoom() == null) {
            asset.setAssignedTo(null);
            asset.setAssignedDate(null);
        }

        asset.setWarrantyExpiry(calculateWarrantyExpiry(asset.getPurchaseDate(), asset.getWarrantyMonths()));
        asset.setNextMaintenanceDate(calculateNextMaintenanceDate(
                asset.getLastMaintenanceDate(), asset.getInstallDate(), asset.getMaintenanceCycle()));
        asset.setCurrentValue(calculateCurrentValue(
                asset.getPurchasePrice(), asset.getPurchaseDate(), asset.getDepreciationRate(), asset.getStatus()));
    }

    private LocalDate calculateWarrantyExpiry(LocalDate purchaseDate, Integer warrantyMonths) {
        if (purchaseDate == null || warrantyMonths == null || warrantyMonths <= 0) {
            return null;
        }
        return purchaseDate.plusMonths(warrantyMonths);
    }

    private LocalDate calculateNextMaintenanceDate(
            LocalDate lastMaintenanceDate, LocalDate installDate, Integer maintenanceCycle) {
        if (maintenanceCycle == null || maintenanceCycle <= 0) {
            return null;
        }

        LocalDate baseDate = lastMaintenanceDate != null ? lastMaintenanceDate : installDate;
        return baseDate != null ? baseDate.plusMonths(maintenanceCycle) : null;
    }

    private BigDecimal calculateCurrentValue(
            BigDecimal purchasePrice, LocalDate purchaseDate, BigDecimal depreciationRate, PropertyAssetStatus status) {
        if (purchasePrice == null) {
            return BigDecimal.ZERO;
        }

        if (status == PropertyAssetStatus.DISPOSED) {
            return BigDecimal.ZERO;
        }

        if (purchaseDate == null || depreciationRate == null || depreciationRate.compareTo(BigDecimal.ZERO) <= 0) {
            return purchasePrice;
        }

        long months = Math.max(
                0,
                ChronoUnit.MONTHS.between(
                        purchaseDate.withDayOfMonth(1), LocalDate.now().withDayOfMonth(1)));
        BigDecimal monthlyRate = depreciationRate.divide(BigDecimal.valueOf(1200), 8, RoundingMode.HALF_UP);
        BigDecimal depreciationFactor = BigDecimal.ONE.subtract(monthlyRate.multiply(BigDecimal.valueOf(months)));

        if (depreciationFactor.compareTo(BigDecimal.ZERO) < 0) {
            depreciationFactor = BigDecimal.ZERO;
        }

        return purchasePrice.multiply(depreciationFactor).setScale(2, RoundingMode.HALF_UP);
    }

    private String normalizeText(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private void createInitialHistory(PropertyAsset asset) {
        PropertyAssetAction action =
                asset.getRoom() != null ? PropertyAssetAction.INSTALL : PropertyAssetAction.PURCHASE;
        String note = asset.getRoom() != null
                ? "Tạo mới và bàn giao tài sản vào phòng " + asset.getRoom().getRoomNumber()
                : "Tạo mới tài sản lưu kho/chưa gán phòng";
        recordHistory(asset, action, note);
    }

    private void appendUpdateHistory(PropertyAsset asset, Integer previousRoomId, PropertyAssetStatus previousStatus) {
        PropertyAssetAction action = PropertyAssetAction.UPDATE;
        String note = "Cập nhật thông tin tài sản";

        Integer currentRoomId = asset.getRoom() != null ? asset.getRoom().getId() : null;
        if ((previousRoomId == null && currentRoomId != null)
                || (previousRoomId != null && !previousRoomId.equals(currentRoomId))) {
            action = PropertyAssetAction.MOVE;
            note = currentRoomId != null
                    ? "Điều chuyển tài sản sang phòng " + asset.getRoom().getRoomNumber()
                    : "Chuyển tài sản về kho/chưa gán phòng";
        } else if (previousStatus != asset.getStatus()) {
            if (asset.getStatus() == PropertyAssetStatus.MAINTENANCE) {
                action = PropertyAssetAction.MAINTENANCE;
                note = "Cập nhật trạng thái sang bảo trì";
            } else if (asset.getStatus() == PropertyAssetStatus.BROKEN) {
                action = PropertyAssetAction.REPORT;
                note = "Cập nhật trạng thái tài sản hỏng hóc";
            }
        }

        recordHistory(asset, action, note);
    }

    private void recordHistory(PropertyAsset asset, PropertyAssetAction action, String note) {
        String performedBy = SecurityUtils.getCurrentUser() != null
                ? SecurityUtils.getCurrentUser().getFullName()
                : "System";

        PropertyAssetHistory history = PropertyAssetHistory.builder()
                .propertyAsset(asset)
                .action(action)
                .actionDate(LocalDateTime.now())
                .performedBy(performedBy)
                .note(note)
                .build();

        propertyAssetHistoryRepository.save(history);
    }
}
