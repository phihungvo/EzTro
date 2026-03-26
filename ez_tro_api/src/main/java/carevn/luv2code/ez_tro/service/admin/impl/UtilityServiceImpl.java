package carevn.luv2code.ez_tro.service.admin.impl;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.requests.UtilityRequest;
import carevn.luv2code.ez_tro.dto.response.UtilityResponse;
import carevn.luv2code.ez_tro.entity.BoardingHouse;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.entity.Utility;
import carevn.luv2code.ez_tro.enums.ServiceType;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.UtilityMapper;
import carevn.luv2code.ez_tro.repository.BoardingHouseRepository;
import carevn.luv2code.ez_tro.repository.UtilityRepository;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.UtilityService;
import lombok.RequiredArgsConstructor;

/**
 * Service quản lý tiện ích/dịch vụ (Utility) của khu nhà trọ.
 *
 * <p>Utility có thể dùng cho meter reading và billing rule. Quyền truy cập dựa theo owner của boarding house,
 * admin có thể xem tất cả.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class UtilityServiceImpl implements UtilityService {

    private final UtilityRepository utilityRepository;
    private final BoardingHouseRepository boardingHouseRepository;
    private final UtilityMapper utilityMapper;

    /**
     * Tạo mới utility.
     *
     * @param request payload tạo utility
     * @return utility DTO sau khi tạo
     */
    @Override
    public UtilityResponse create(UtilityRequest request) {
        Utility utility = utilityMapper.toEntity(request);

        BoardingHouse house = getBoardingHouseOrThrow(request.getBoardingHouseId());
        validateBoardingHouseAccess(house);
        utility.setBoardingHouse(house);

        utility.setType(ServiceType.valueOf(request.getType()));

        utility = utilityRepository.save(utility);
        return utilityMapper.toResponse(utility);
    }

    /**
     * Cập nhật utility theo id.
     *
     * @param id id utility
     * @param request payload cập nhật utility
     * @return utility DTO sau cập nhật
     */
    @Override
    public UtilityResponse update(Integer id, UtilityRequest request) {
        Utility utility =
                utilityRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.UTILITY_NOT_FOUND));
        validateUtilityAccess(utility);

        utilityMapper.toEntity(utility, request);

        if (request.getBoardingHouseId() != null) {
            BoardingHouse house = getBoardingHouseOrThrow(request.getBoardingHouseId());
            validateBoardingHouseAccess(house);
            utility.setBoardingHouse(house);
        }

        utility.setType(ServiceType.valueOf(request.getType()));

        utility = utilityRepository.save(utility);
        return utilityMapper.toResponse(utility);
    }

    /**
     * Xóa utility theo id.
     *
     * @param id id utility
     */
    @Override
    public void delete(Integer id) {
        Utility utility =
                utilityRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.UTILITY_NOT_FOUND));
        validateUtilityAccess(utility);
        utilityRepository.delete(utility);
    }

    /**
     * Lấy utility theo id.
     *
     * @param id id utility
     * @return utility DTO
     */
    @Override
    @Transactional(readOnly = true)
    public UtilityResponse getById(Integer id) {
        Utility utility =
                utilityRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.UTILITY_NOT_FOUND));
        validateUtilityAccess(utility);
        return utilityMapper.toResponse(utility);
    }

    /**
     * Lấy danh sách utilities theo role hiện tại.
     *
     * @return danh sách utility DTO
     */
    @Override
    @Transactional(readOnly = true)
    public List<UtilityResponse> getAll() {
        User currentUser = getCurrentUserOrThrow();
        List<Utility> utilities = SecurityUtils.isAdmin()
                ? utilityRepository.findAll()
                : utilityRepository.findByBoardingHouse_Owner_Id(currentUser.getId());

        return utilities.stream().map(utilityMapper::toResponse).toList();
    }

    /**
     * Lấy danh sách utilities phân trang theo role hiện tại.
     *
     * @param page trang (0-based)
     * @param size kích thước trang
     * @return page utility DTO
     */
    @Override
    @Transactional(readOnly = true)
    public Page<UtilityResponse> getAllPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        User currentUser = getCurrentUserOrThrow();
        Page<Utility> utilities = SecurityUtils.isAdmin()
                ? utilityRepository.findAll(pageable)
                : utilityRepository.findByBoardingHouse_Owner_Id(currentUser.getId(), pageable);
        return utilities.map(utilityMapper::toResponse);
    }

    /**
     * Lấy danh sách utilities theo khu nhà trọ.
     *
     * @param boardingHouseId id khu nhà trọ
     * @return danh sách utility DTO
     */
    @Override
    @Transactional(readOnly = true)
    public List<UtilityResponse> getByBoardingHouse(Integer boardingHouseId) {
        BoardingHouse house = getBoardingHouseOrThrow(boardingHouseId);
        validateBoardingHouseAccess(house);
        return utilityRepository.findByBoardingHouseId(boardingHouseId).stream()
                .map(utilityMapper::toResponse)
                .toList();
    }

    /**
     * Lấy utilities active theo khu nhà trọ (phân trang).
     *
     * @param boardingHouseId id khu nhà trọ
     * @param page trang (0-based)
     * @param size kích thước trang
     * @return page utility DTO
     */
    @Override
    @Transactional(readOnly = true)
    public Page<UtilityResponse> getActiveByBoardingHouse(Integer boardingHouseId, int page, int size) {
        BoardingHouse house = getBoardingHouseOrThrow(boardingHouseId);
        validateBoardingHouseAccess(house);
        Pageable pageable = PageRequest.of(page, size);
        return utilityRepository
                .findActiveByBoardingHouseId(boardingHouseId, pageable)
                .map(utilityMapper::toResponse);
    }

    /**
     * Lấy danh sách utilities của khu nhà trọ (alias).
     *
     * @param boardingHouseId id khu nhà trọ
     * @return danh sách utility DTO
     */
    @Override
    public List<UtilityResponse> getUtilitiesByBoardingHouse(Integer boardingHouseId) {
        BoardingHouse house = getBoardingHouseOrThrow(boardingHouseId);
        validateBoardingHouseAccess(house);
        return utilityRepository.findAllByBoardingHouseId(boardingHouseId).stream()
                .map(utilityMapper::toResponse)
                .toList();
    }

    private BoardingHouse getBoardingHouseOrThrow(Integer boardingHouseId) {
        if (boardingHouseId == null) {
            throw new AppException(ErrorCode.BOARDING_HOUSE_NOT_FOUND);
        }

        return boardingHouseRepository
                .findById(boardingHouseId)
                .orElseThrow(() -> new AppException(ErrorCode.BOARDING_HOUSE_NOT_FOUND));
    }

    private void validateBoardingHouseAccess(BoardingHouse boardingHouse) {
        User currentUser = getCurrentUserOrThrow();
        if (!SecurityUtils.isAdmin() && !boardingHouse.getOwner().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
    }

    private void validateUtilityAccess(Utility utility) {
        if (utility.getBoardingHouse() == null) {
            if (!SecurityUtils.isAdmin()) {
                throw new AppException(ErrorCode.ACCESS_DENIED);
            }
            return;
        }

        validateBoardingHouseAccess(utility.getBoardingHouse());
    }

    private User getCurrentUserOrThrow() {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return currentUser;
    }
}
