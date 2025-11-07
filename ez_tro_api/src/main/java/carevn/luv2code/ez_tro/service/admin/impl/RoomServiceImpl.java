package carevn.luv2code.ez_tro.service.admin.impl;

import java.time.LocalDate;
import java.util.List;

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

    private final RoomRepository roomRepository;
    private final BoardingHouseRepository boardingHouseRepository;
    private final BuildingRepository buildingRepository;
    private final UtilityRepository utilityRepository;
    private final RoomMapper roomMapper;

    @Override
    @Transactional
    public RoomResponse create(RoomRequest request) {
        BoardingHouse boardingHouse = getBoardingHouseOrThrow(request.getBoardingHouseId());

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

    @Override
    public RoomResponse update(Integer id, RoomRequest request) {
        Room room = getRoomOrThrow(id);

        room.setRoomNumber(request.getRoomNumber());
        room.setArea(request.getArea());
        room.setPrice(request.getPrice());
        room.setStatus(request.getStatus());
        room.setNote(request.getNote());

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
    public List<RoomResponse> getAvailableRooms() {
        return roomRepository.findByStatus(RoomStatus.AVAILABLE).stream()
                .map(roomMapper::toResponse)
                .toList();
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
