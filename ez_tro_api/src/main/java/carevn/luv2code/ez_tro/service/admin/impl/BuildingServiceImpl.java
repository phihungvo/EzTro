package carevn.luv2code.ez_tro.service.admin.impl;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.requests.BuildingRequest;
import carevn.luv2code.ez_tro.dto.response.BuildingResponse;
import carevn.luv2code.ez_tro.entity.BoardingHouse;
import carevn.luv2code.ez_tro.entity.Building;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.BuildingMapper;
import carevn.luv2code.ez_tro.repository.BoardingHouseRepository;
import carevn.luv2code.ez_tro.repository.BuildingRepository;
import carevn.luv2code.ez_tro.repository.RoomRepository;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.BuildingService;
import carevn.luv2code.ez_tro.specification.BuildingSpecs;
import carevn.luv2code.ez_tro.specification.RoomSpecs;
import lombok.RequiredArgsConstructor;

/**
 * Service xử lý nghiệp vụ Tòa nhà (Building) phía admin/owner.
 *
 * <p>Trách nhiệm chính:
 * <ul>
 *   <li>CRUD building trong khu nhà trọ.</li>
 *   <li>Kiểm soát quyền: owner chỉ thao tác trên boarding house của mình.</li>
 *   <li>Kiểm tra quota (resource limits) khi tạo mới building.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Transactional
public class BuildingServiceImpl implements BuildingService {

    private final BuildingRepository buildingRepository;
    private final BoardingHouseRepository boardingHouseRepository;
    private final RoomRepository roomRepository;
    private final BuildingMapper buildingMapper;
    private final ResourceLimitServiceImpl resourceLimitService;

    /**
     * Lấy danh sách building phân trang theo role hiện tại.
     *
     * @param pageable tham số phân trang/sort
     * @return page building DTO
     */
    @Override
    public Page<BuildingResponse> getAllBuildingsByRole(Pageable pageable) {
        User currentUser = SecurityUtils.getCurrentUser();
        boolean isAdmin = currentUser.getRoles().stream().anyMatch(role -> "ADMIN".equals(role.getName()));

        Specification<Building> spec = Specification.where(BuildingSpecs.hasBoardingHouse());

        if (!isAdmin) {
            spec = spec.and(BuildingSpecs.ownedBy(currentUser));
        }
        return buildingRepository.findAll(spec, pageable).map(buildingMapper::toResponse);
    }

    /**
     * Tạo mới building.
     *
     * @param request payload tạo building
     * @return building DTO sau khi tạo
     */
    @Override
    public BuildingResponse create(BuildingRequest request) {
        BoardingHouse house = boardingHouseRepository
                .findById(request.getBoardingHouseId())
                .orElseThrow(() -> new AppException(ErrorCode.BOARDING_HOUSE_NOT_FOUND));
        validateBoardingHouseAccess(house);
        resourceLimitService.validateCanCreateBuilding(house.getOwner().getId());

        Building building = buildingMapper.toEntity(request);
        building.setBoardingHouse(house);
        return buildingMapper.toResponse(buildingRepository.save(building));
    }

    /**
     * Cập nhật building theo id.
     *
     * @param id id building
     * @param request payload cập nhật
     * @return building DTO sau khi cập nhật
     */
    @Override
    public BuildingResponse update(Integer id, BuildingRequest request) {
        Building building =
                buildingRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.BUILDING_NOT_FOUND));
        validateBoardingHouseAccess(building.getBoardingHouse());

        BoardingHouse targetBoardingHouse = boardingHouseRepository
                .findById(request.getBoardingHouseId())
                .orElseThrow(() -> new AppException(ErrorCode.BOARDING_HOUSE_NOT_FOUND));
        validateBoardingHouseAccess(targetBoardingHouse);

        building.setName(request.getName());
        building.setDescription(request.getDescription());
        building.setTotalFloors(request.getTotalFloors());
        building.setBoardingHouse(targetBoardingHouse);

        return buildingMapper.toResponse(buildingRepository.save(building));
    }

    /**
     * Xóa building theo id.
     *
     * <p>Chặn xóa nếu building còn phòng.
     *
     * @param id id building
     */
    @Override
    public void delete(Integer id) {
        Building building =
                buildingRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.BUILDING_NOT_FOUND));
        validateBoardingHouseAccess(building.getBoardingHouse());
        if (!roomRepository.findAll(RoomSpecs.inBuilding(building.getId())).isEmpty()) {
            throw new AppException(ErrorCode.BUILDING_DELETE_NOT_ALLOWED);
        }
        buildingRepository.delete(building);
    }

    /**
     * Lấy building theo id.
     *
     * @param id id building
     * @return building DTO
     */
    @Override
    @Transactional(readOnly = true)
    public BuildingResponse getById(Integer id) {
        Building building =
                buildingRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.BUILDING_NOT_FOUND));
        validateBoardingHouseAccess(building.getBoardingHouse());
        return buildingMapper.toResponse(building);
    }

    /**
     * Lấy danh sách building theo role hiện tại (không phân trang).
     *
     * @return danh sách building DTO
     */
    @Override
    @Transactional(readOnly = true)
    public List<BuildingResponse> getAll() {
        return getAllBuildingsByRole(Pageable.unpaged()).getContent();
    }

    /**
     * Lấy danh sách building phân trang theo page/size.
     *
     * @param page trang (0-based)
     * @param size kích thước trang
     * @return page building DTO
     */
    @Override
    public Page<BuildingResponse> getAllBuildingsPaged(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        return buildingRepository.findAll(pageRequest).map(buildingMapper::toResponse);
    }

    /**
     * Lấy danh sách building theo khu nhà trọ.
     *
     * @param boardingHouseId id khu nhà trọ
     * @return danh sách building DTO
     */
    @Override
    @Transactional(readOnly = true)
    public List<BuildingResponse> getByBoardingHouse(Integer boardingHouseId) {
        BoardingHouse house = boardingHouseRepository
                .findById(boardingHouseId)
                .orElseThrow(() -> new AppException(ErrorCode.BOARDING_HOUSE_NOT_FOUND));
        validateBoardingHouseAccess(house);

        return buildingRepository.findByBoardingHouseId(boardingHouseId).stream()
                .map(buildingMapper::toResponse)
                .toList();
    }

    private void validateBoardingHouseAccess(BoardingHouse house) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        if (!SecurityUtils.isAdmin() && !house.getOwner().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
    }
}
