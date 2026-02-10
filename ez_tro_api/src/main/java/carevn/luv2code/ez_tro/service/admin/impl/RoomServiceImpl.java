package carevn.luv2code.ez_tro.service.admin.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.constants.AppConstants;
import carevn.luv2code.ez_tro.dto.requests.RoomRequest;
import carevn.luv2code.ez_tro.dto.response.RoomResponse;
import carevn.luv2code.ez_tro.entity.*;
import carevn.luv2code.ez_tro.enums.RoomStatus;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.RoomMapper;
import carevn.luv2code.ez_tro.repository.BoardingHouseRepository;
import carevn.luv2code.ez_tro.repository.BuildingRepository;
import carevn.luv2code.ez_tro.repository.RoomRepository;
import carevn.luv2code.ez_tro.repository.UtilityRepository;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.RoomService;
import carevn.luv2code.ez_tro.specification.RoomSpecs;
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
    public List<RoomResponse> getAllByRole() {
        return getAllRoomsByRole(Pageable.unpaged()).getContent();
    }

    @Override
    public List<RoomResponse> getByBoardingHouseId(Integer boardingHouseId) {
        return roomRepository.findByBoardingHouseId(boardingHouseId).stream()
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
}
