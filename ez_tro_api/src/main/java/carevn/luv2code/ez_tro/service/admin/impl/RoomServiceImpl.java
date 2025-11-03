package carevn.luv2code.ez_tro.service.admin.impl;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import carevn.luv2code.ez_tro.dto.requests.RoomRequest;
import carevn.luv2code.ez_tro.dto.response.RoomResponse;
import carevn.luv2code.ez_tro.entity.BoardingHouse;
import carevn.luv2code.ez_tro.entity.Room;
import carevn.luv2code.ez_tro.enums.RoomStatus;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.RoomMapper;
import carevn.luv2code.ez_tro.repository.BoardingHouseRepository;
import carevn.luv2code.ez_tro.repository.RoomRepository;
import carevn.luv2code.ez_tro.service.admin.RoomService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final BoardingHouseRepository boardingHouseRepository;
    private final RoomMapper roomMapper;

    @Override
    public RoomResponse create(RoomRequest request) {
        BoardingHouse boardingHouse = getBoardingHouseOrThrow(request.getBoardingHouseId());

        Room room = roomMapper.toEntity(request);
        room.setBoardingHouse(boardingHouse);

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
    public List<RoomResponse> getByBoardingHouseId(Integer boardingHouseId) {
        return roomRepository.findByBoardingHouseId(boardingHouseId).stream()
                .map(roomMapper::toResponse)
                .toList();
    }

    /** -------------------- PRIVATE UTILITY METHODS -------------------- */
    private Room getRoomOrThrow(Integer id) {
        return roomRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
    }

    private BoardingHouse getBoardingHouseOrThrow(Integer id) {
        return boardingHouseRepository
                .findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOARDING_HOUSE_NOT_FOUND));
    }
}
