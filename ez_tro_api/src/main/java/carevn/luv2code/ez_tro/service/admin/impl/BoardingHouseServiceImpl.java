package carevn.luv2code.ez_tro.service.admin.impl;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import carevn.luv2code.ez_tro.dto.requests.BoardingHouseRequest;
import carevn.luv2code.ez_tro.dto.response.BoardingHouseResponse;
import carevn.luv2code.ez_tro.entity.BoardingHouse;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.BoardingHouseMapper;
import carevn.luv2code.ez_tro.repository.BoardingHouseRepository;
import carevn.luv2code.ez_tro.repository.RoomRepository;
import carevn.luv2code.ez_tro.repository.UserRepository;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.BoardingHouseService;
import carevn.luv2code.ez_tro.service.admin.SystemConfigService;
import carevn.luv2code.ez_tro.specification.BoardingHouseSpecs;
import lombok.RequiredArgsConstructor;

/**
 * Service xử lý nghiệp vụ Khu nhà trọ (BoardingHouse) phía admin/owner.
 *
 * <p>Chịu trách nhiệm CRUD khu nhà trọ và kiểm soát quyền truy cập:
 * <ul>
 *   <li>Owner chỉ thao tác trên dữ liệu của mình.</li>
 *   <li>Admin có thể thao tác/ủy quyền owner thông qua ownerId trong request.</li>
 * </ul>
 *
 * <p>Ngoài ra, khi tạo khu nhà trọ sẽ đảm bảo owner có subscription mặc định và kiểm tra quota tạo mới.
 */
@Service
@RequiredArgsConstructor
public class BoardingHouseServiceImpl implements BoardingHouseService {
    private final BoardingHouseRepository boardingHouseRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final BoardingHouseMapper boardingHouseMapper;
    private final ResourceLimitServiceImpl resourceLimitService;
    private final SystemConfigService systemConfigService;

    /**
     * Tạo mới khu nhà trọ.
     *
     * @param request payload tạo khu nhà trọ
     * @return DTO khu nhà trọ sau khi tạo
     */
    @Override
    public BoardingHouseResponse create(BoardingHouseRequest request) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (!SecurityUtils.isOwner() && !SecurityUtils.isAdmin()) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        User owner = resolveOwnerForMutation(request, currentUser);
        systemConfigService.ensureDefaultSubscriptionForOwner(owner);
        resourceLimitService.validateCanCreateBoardingHouse(owner.getId());

        BoardingHouse house = boardingHouseMapper.toEntity(request);
        house.setOwner(owner);

        boardingHouseRepository.save(house);
        return boardingHouseMapper.toResponse(house);
    }

    /**
     * Cập nhật khu nhà trọ theo id.
     *
     * @param id id khu nhà trọ
     * @param request payload cập nhật
     * @return DTO khu nhà trọ sau khi cập nhật
     */
    @Override
    public BoardingHouseResponse update(Integer id, BoardingHouseRequest request) {
        BoardingHouse house = boardingHouseRepository
                .findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOARDING_HOUSE_NOT_FOUND));
        validateAccess(house);

        User owner = resolveOwnerForMutation(request, SecurityUtils.getCurrentUser());

        house.setName(request.getName());
        house.setAddress(request.getAddress());
        house.setContactPhone(request.getContactPhone());
        house.setDescription(request.getDescription());
        house.setTotalBuildings(request.getTotalBuildings());
        house.setTotalRooms(request.getTotalRooms());
        house.setOwner(owner);

        boardingHouseRepository.save(house);
        return boardingHouseMapper.toResponse(house);
    }

    /**
     * Xóa khu nhà trọ theo id.
     *
     * <p>Chặn xóa nếu khu nhà trọ còn dữ liệu phụ thuộc (buildings/utilities/rooms).
     *
     * @param id id khu nhà trọ
     */
    @Override
    public void delete(Integer id) {
        BoardingHouse house = boardingHouseRepository
                .findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOARDING_HOUSE_NOT_FOUND));
        validateAccess(house);
        if ((house.getBuildings() != null && !house.getBuildings().isEmpty())
                || (house.getUtilities() != null && !house.getUtilities().isEmpty())
                || !roomRepository.findByBoardingHouseId(house.getId()).isEmpty()) {
            throw new AppException(ErrorCode.BOARDING_HOUSE_DELETE_NOT_ALLOWED);
        }
        boardingHouseRepository.delete(house);
    }

    /**
     * Lấy khu nhà trọ theo id.
     *
     * @param id id khu nhà trọ
     * @return DTO khu nhà trọ
     */
    @Override
    public BoardingHouseResponse getById(Integer id) {
        BoardingHouse house = boardingHouseRepository
                .findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOARDING_HOUSE_NOT_FOUND));
        validateAccess(house);
        return boardingHouseMapper.toResponse(house);
    }

    /**
     * Lấy danh sách tất cả khu nhà trọ (không phân quyền).
     *
     * @return danh sách DTO khu nhà trọ
     */
    @Override
    public List<BoardingHouseResponse> getAll() {
        return boardingHouseRepository.findAll().stream()
                .map(boardingHouseMapper::toResponse)
                .toList();
    }

    /**
     * Lấy danh sách khu nhà trọ theo role hiện tại (admin/owner).
     *
     * @return danh sách DTO khu nhà trọ
     */
    @Override
    public List<BoardingHouseResponse> getAllByRole() {
        return getAllPagedByRole(Pageable.unpaged()).getContent();
    }

    /**
     * Lấy danh sách khu nhà trọ phân trang theo role hiện tại.
     *
     * @param pageable tham số phân trang/sort
     * @return page DTO khu nhà trọ
     */
    @Override
    public Page<BoardingHouseResponse> getAllPagedByRole(Pageable pageable) {
        User user = SecurityUtils.getCurrentUser();
        boolean isAdmin = user.getRoles().stream().anyMatch(r -> "ADMIN".equals(r.getName()));

        Specification<BoardingHouse> spec = Specification.where(null);

        if (!isAdmin) {
            spec = spec.and(BoardingHouseSpecs.ownedBy(user));
        }

        return boardingHouseRepository.findAll(spec, pageable).map(boardingHouseMapper::toResponse);
    }

    /**
     * Alias: lấy danh sách khu nhà trọ cho owner hiện tại.
     *
     * @return danh sách DTO khu nhà trọ
     */
    @Override
    public List<BoardingHouseResponse> getAllForOwner() {
        return getAllPagedByRole(Pageable.unpaged()).getContent();
    }

    /**
     * Lấy danh sách khu nhà trọ phân trang theo page/size.
     *
     * @param page trang (0-based)
     * @param size kích thước trang
     * @return page DTO khu nhà trọ
     */
    @Override
    public Page<BoardingHouseResponse> getAllBoardingHousesPaged(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        return boardingHouseRepository.findAll(pageRequest).map(boardingHouseMapper::toResponse);
    }

    private User resolveOwnerForMutation(BoardingHouseRequest request, User currentUser) {
        if (SecurityUtils.isOwner()) {
            return currentUser;
        }

        Integer ownerId = request.getOwnerId();
        if (ownerId == null) {
            throw new AppException(ErrorCode.OWNER_NOT_FOUND);
        }

        User owner = userRepository.findById(ownerId).orElseThrow(() -> new AppException(ErrorCode.OWNER_NOT_FOUND));
        boolean isOwnerRole = owner.getRoles().stream().anyMatch(role -> "OWNER".equals(role.getName()));
        if (!isOwnerRole) {
            throw new AppException(ErrorCode.NOT_AN_OWNER);
        }

        return owner;
    }

    private void validateAccess(BoardingHouse house) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        if (!SecurityUtils.isAdmin() && !house.getOwner().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
    }
}
