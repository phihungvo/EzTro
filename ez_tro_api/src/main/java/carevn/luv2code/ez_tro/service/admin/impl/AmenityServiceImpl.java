package carevn.luv2code.ez_tro.service.admin.impl;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.requests.AmenityRequest;
import carevn.luv2code.ez_tro.dto.response.AmenityResponse;
import carevn.luv2code.ez_tro.entity.*;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.AmenityMapper;
import carevn.luv2code.ez_tro.repository.AmenityRepository;
import carevn.luv2code.ez_tro.repository.BoardingHouseRepository;
import carevn.luv2code.ez_tro.repository.RoomAmenityRepository;
import carevn.luv2code.ez_tro.repository.RoomRepository;
import carevn.luv2code.ez_tro.service.admin.AmenityService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AmenityServiceImpl implements AmenityService {

    private final AmenityRepository amenityRepository;
    private final BoardingHouseRepository boardingHouseRepository;
    private final RoomRepository roomRepository;
    private final RoomAmenityRepository roomAmenityRepository;
    private final AmenityMapper amenityMapper;

    @Override
    public AmenityResponse create(AmenityRequest request) {
        // Lấy danh sách Boarding House
        List<BoardingHouse> houses = boardingHouseRepository.findAllById(request.getBoardingHouseIds());
        if (houses.isEmpty()) {
            throw new AppException(ErrorCode.BOARDING_HOUSE_NOT_FOUND);
        }

        // Lấy tất cả Room thuộc các boarding house này
        List<Room> validRooms = roomRepository.findAllByBoardingHouse_IdIn(request.getBoardingHouseIds());
        Set<Integer> validRoomIds = validRooms.stream().map(Room::getId).collect(Collectors.toSet());

        // Kiểm tra roomIds gửi lên có hợp lệ không
        if (!validRoomIds.containsAll(request.getRoomIds())) {
            throw new AppException(ErrorCode.INVALID_ROOM_FOR_BOARDING_HOUSE);
        }

        Amenity lastSaved = null;

        // Tạo amenity cho từng boarding house
        for (BoardingHouse house : houses) {
            if (amenityRepository.existsByNameAndBoardingHouse_Id(request.getName(), house.getId())) {
                throw new AppException(ErrorCode.AMENITY_NAME_ALREADY_EXISTS);
            }

            Amenity amenity = amenityMapper.toEntity(request);
            amenity.setBoardingHouse(house);
            amenity.setIsActive(true);
            Amenity savedAmenity = amenityRepository.save(amenity);

            // Gắn vào các phòng (RoomAmenity)
            List<Room> roomsToAttach = validRooms.stream()
                    .filter(r -> r.getBoardingHouse().getId().equals(house.getId()))
                    .filter(r -> request.getRoomIds().contains(r.getId()))
                    .toList();

            for (Room room : roomsToAttach) {
                RoomAmenityId id = new RoomAmenityId(room.getId(), savedAmenity.getId());
                RoomAmenity ra = RoomAmenity.builder()
                        .id(id)
                        .room(room)
                        .amenity(savedAmenity)
                        .quantity(1)
                        .startDate(java.time.LocalDate.now())
                        .build();
                roomAmenityRepository.save(ra);
            }

            lastSaved = savedAmenity; // lấy cái cuối cùng để trả về
        }

        return amenityMapper.toResponse(lastSaved);
    }

    @Override
    public AmenityResponse update(Integer id, AmenityRequest request) {
        Amenity service =
                amenityRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.AMENITY_NOT_FOUND));

        amenityMapper.updateEntity(service, request);
        return amenityMapper.toResponse(amenityRepository.save(service));
    }

    @Override
    public void delete(Integer id) {
        if (!amenityRepository.existsById(id)) {
            throw new AppException(ErrorCode.AMENITY_NOT_FOUND);
        }
        amenityRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public AmenityResponse getById(Integer id) {
        Amenity service =
                amenityRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.AMENITY_NOT_FOUND));
        return amenityMapper.toResponse(service);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AmenityResponse> getAll() {
        return amenityMapper.toResponseList(amenityRepository.findAll());
    }

    @Override
    public Page<AmenityResponse> getAllAmenitiesPaged(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        return amenityRepository.findAll(pageRequest).map(amenityMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AmenityResponse> getByBoardingHouse(Integer boardingHouseId) {
        return amenityMapper.toResponseList(amenityRepository.findAllByBoardingHouse_Id(boardingHouseId));
    }
}
