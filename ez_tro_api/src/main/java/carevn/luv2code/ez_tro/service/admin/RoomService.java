package carevn.luv2code.ez_tro.service.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import carevn.luv2code.ez_tro.dto.requests.RoomRequest;
import carevn.luv2code.ez_tro.dto.response.RoomResponse;

public interface RoomService {
    RoomResponse create(RoomRequest request);

    RoomResponse update(Integer id, RoomRequest request);

    void delete(Integer id);

    RoomResponse getById(Integer id);

    List<RoomResponse> getAll();

    List<RoomResponse> getAvailableRooms();

    Page<RoomResponse> getAllRoomsPaged(int page, int size);

    Page<RoomResponse> getAllRoomsByRole(Pageable pageable);

    List<RoomResponse> getAllByRole();

    List<RoomResponse> getByBoardingHouseId(Integer boardingHouseId);
}
