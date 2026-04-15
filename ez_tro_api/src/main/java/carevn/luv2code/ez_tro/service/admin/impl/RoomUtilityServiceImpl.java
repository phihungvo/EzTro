package carevn.luv2code.ez_tro.service.admin.impl;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.requests.RoomUtilityRequest;
import carevn.luv2code.ez_tro.dto.response.RoomUtilityResponse;
import carevn.luv2code.ez_tro.entity.BoardingHouse;
import carevn.luv2code.ez_tro.entity.Room;
import carevn.luv2code.ez_tro.entity.RoomUtility;
import carevn.luv2code.ez_tro.entity.RoomUtilityId;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.entity.Utility;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.RoomUtilityMapper;
import carevn.luv2code.ez_tro.repository.RoomRepository;
import carevn.luv2code.ez_tro.repository.RoomUtilityRepository;
import carevn.luv2code.ez_tro.repository.UtilityRepository;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.RoomUtilityService;
import lombok.RequiredArgsConstructor;

/**
 * Service quản lý đăng ký tiện ích theo phòng (RoomUtility).
 *
 * <p>Service đảm bảo quyền truy cập (admin/owner) và validate utility thuộc đúng boarding house của phòng.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class RoomUtilityServiceImpl implements RoomUtilityService {

    private final RoomUtilityRepository roomUtilityRepository;
    private final RoomRepository roomRepository;
    private final UtilityRepository utilityRepository;
    private final RoomUtilityMapper roomUtilityMapper;

    /**
     * Tạo mới đăng ký utility cho phòng.
     *
     * @param request payload tạo room-utility
     * @return DTO room-utility sau khi tạo
     */
    @Override
    public RoomUtilityResponse create(RoomUtilityRequest request) {
        Room room = roomRepository
                .findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        validateRoomAccess(room);
        Utility utility = utilityRepository
                .findById(request.getUtilityId())
                .orElseThrow(() -> new AppException(ErrorCode.UTILITY_NOT_FOUND));
        validateUtilityAccess(utility);
        validateUtilityActive(utility);
        validateUtilityBelongsToRoomBoardingHouse(room, utility);

        RoomUtilityId id = new RoomUtilityId(request.getRoomId(), request.getUtilityId());

        // Check if already exists
        if (roomUtilityRepository.existsById(id)) {
            throw new AppException(ErrorCode.ROOM_UTILITY_ALREADY_EXISTS);
        }

        RoomUtility roomUtility = roomUtilityMapper.toEntity(request);
        roomUtility.setId(id);
        roomUtility.setRoom(room);
        roomUtility.setUtility(utility);

        roomUtility = roomUtilityRepository.save(roomUtility);
        return roomUtilityMapper.toResponse(roomUtility);
    }

    /**
     * Cập nhật đăng ký utility theo cặp (roomId, utilityId).
     *
     * @param roomId id phòng
     * @param utilityId id utility
     * @param request payload cập nhật
     * @return DTO room-utility sau cập nhật
     */
    @Override
    public RoomUtilityResponse update(Integer roomId, Integer utilityId, RoomUtilityRequest request) {
        validateRequestIdentity(roomId, utilityId, request);

        RoomUtilityId id = new RoomUtilityId(roomId, utilityId);
        RoomUtility roomUtility = roomUtilityRepository
                .findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_UTILITY_NOT_FOUND));
        validateRoomUtilityAccess(roomUtility);
        validateUtilityActive(roomUtility.getUtility());

        roomUtilityMapper.toEntity(roomUtility, request);

        roomUtility = roomUtilityRepository.save(roomUtility);
        return roomUtilityMapper.toResponse(roomUtility);
    }

    /**
     * Xóa đăng ký utility theo cặp (roomId, utilityId).
     *
     * @param roomId id phòng
     * @param utilityId id utility
     */
    @Override
    public void delete(Integer roomId, Integer utilityId) {
        RoomUtilityId id = new RoomUtilityId(roomId, utilityId);
        RoomUtility roomUtility = roomUtilityRepository
                .findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_UTILITY_NOT_FOUND));
        validateRoomUtilityAccess(roomUtility);
        roomUtilityRepository.delete(roomUtility);
    }

    /**
     * Lấy room-utility theo cặp (roomId, utilityId).
     *
     * @param roomId id phòng
     * @param utilityId id utility
     * @return DTO room-utility
     */
    @Override
    @Transactional(readOnly = true)
    public RoomUtilityResponse getById(Integer roomId, Integer utilityId) {
        RoomUtilityId id = new RoomUtilityId(roomId, utilityId);
        RoomUtility roomUtility = roomUtilityRepository
                .findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_UTILITY_NOT_FOUND));
        validateRoomUtilityAccess(roomUtility);
        return roomUtilityMapper.toResponse(roomUtility);
    }

    /**
     * Lấy danh sách room-utilities theo phòng.
     *
     * @param roomId id phòng
     * @return danh sách DTO room-utilities
     */
    @Override
    @Transactional(readOnly = true)
    public List<RoomUtilityResponse> getByRoomId(Integer roomId) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        validateRoomAccess(room);
        return roomUtilityRepository.findByRoomId(roomId).stream()
                .map(roomUtilityMapper::toResponse)
                .toList();
    }

    /**
     * Lấy danh sách room-utilities active theo phòng.
     *
     * @param roomId id phòng
     * @return danh sách DTO room-utilities active
     */
    @Override
    @Transactional(readOnly = true)
    public List<RoomUtilityResponse> getActiveByRoomId(Integer roomId) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        validateRoomAccess(room);
        return roomUtilityRepository.findActiveByRoomId(roomId).stream()
                .map(roomUtilityMapper::toResponse)
                .toList();
    }

    /**
     * Lấy danh sách room-utilities theo utility.
     *
     * @param utilityId id utility
     * @return danh sách DTO room-utilities
     */
    @Override
    @Transactional(readOnly = true)
    public List<RoomUtilityResponse> getByUtilityId(Integer utilityId) {
        Utility utility =
                utilityRepository.findById(utilityId).orElseThrow(() -> new AppException(ErrorCode.UTILITY_NOT_FOUND));
        validateUtilityAccess(utility);
        return roomUtilityRepository.findByUtilityId(utilityId).stream()
                .map(roomUtilityMapper::toResponse)
                .toList();
    }

    /**
     * Lấy danh sách room-utilities theo phòng (phân trang).
     *
     * @param roomId id phòng
     * @param page trang (0-based)
     * @param size kích thước trang
     * @return page DTO room-utilities
     */
    @Override
    @Transactional(readOnly = true)
    public Page<RoomUtilityResponse> getByRoomIdPaged(Integer roomId, int page, int size) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        validateRoomAccess(room);
        Pageable pageable = PageRequest.of(page, size);
        return roomUtilityRepository.findByRoomIdPaged(roomId, pageable).map(roomUtilityMapper::toResponse);
    }

    /**
     * Lấy danh sách room-utilities phân trang theo role hiện tại.
     *
     * @param page trang (0-based)
     * @param size kích thước trang
     * @return page DTO room-utilities
     */
    @Override
    @Transactional(readOnly = true)
    public Page<RoomUtilityResponse> getAllPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        User currentUser = getCurrentUserOrThrow();
        Page<RoomUtility> roomUtilities = SecurityUtils.isAdmin()
                ? roomUtilityRepository.findAllPaged(pageable)
                : roomUtilityRepository.findAllByRoom_BoardingHouse_Owner_Id(currentUser.getId(), pageable);
        return roomUtilities.map(roomUtilityMapper::toResponse);
    }

    private void validateRoomUtilityAccess(RoomUtility roomUtility) {
        validateRoomAccess(roomUtility.getRoom());
        validateUtilityAccess(roomUtility.getUtility());
    }

    private void validateRoomAccess(Room room) {
        User currentUser = getCurrentUserOrThrow();
        if (!SecurityUtils.isAdmin()
                && !room.getBoardingHouse().getOwner().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
    }

    private void validateUtilityAccess(Utility utility) {
        User currentUser = getCurrentUserOrThrow();
        if (SecurityUtils.isAdmin()) {
            return;
        }

        Integer ownerId = utility.getOwner() != null ? utility.getOwner().getId() : null;
        boolean accessible = ownerId != null && ownerId.equals(currentUser.getId());

        if (!accessible
                && utility.getBoardingHouses() != null
                && !utility.getBoardingHouses().isEmpty()) {
            accessible = utility.getBoardingHouses().stream()
                    .anyMatch(house ->
                            house.getOwner() != null && house.getOwner().getId().equals(currentUser.getId()));
        }

        if (!accessible) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
    }

    private void validateUtilityActive(Utility utility) {
        if (utility.getIsActive() != null && !utility.getIsActive()) {
            throw new AppException(ErrorCode.UTILITY_INACTIVE);
        }
    }

    private void validateUtilityBelongsToRoomBoardingHouse(Room room, Utility utility) {
        if (!utilityMatchesBoardingHouse(utility, room.getBoardingHouse())) {
            throw new AppException(ErrorCode.UTILITY_NOT_BELONG_TO_ROOM_BOARDING_HOUSE);
        }
    }

    private boolean utilityMatchesBoardingHouse(Utility utility, BoardingHouse boardingHouse) {
        if (utility.getBoardingHouses() == null || utility.getBoardingHouses().isEmpty()) {
            return utility.getOwner() != null
                    && boardingHouse != null
                    && boardingHouse.getOwner() != null
                    && utility.getOwner()
                            .getId()
                            .equals(boardingHouse.getOwner().getId());
        }

        return utility.getBoardingHouses().stream()
                .anyMatch(house -> house.getId().equals(boardingHouse.getId()));
    }

    private void validateRequestIdentity(Integer roomId, Integer utilityId, RoomUtilityRequest request) {
        if (!roomId.equals(request.getRoomId()) || !utilityId.equals(request.getUtilityId())) {
            throw new AppException(ErrorCode.ROOM_UTILITY_REQUEST_ID_MISMATCH);
        }
    }

    private User getCurrentUserOrThrow() {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return currentUser;
    }
}
