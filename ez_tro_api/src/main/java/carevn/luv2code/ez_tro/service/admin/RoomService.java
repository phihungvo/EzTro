package carevn.luv2code.ez_tro.service.admin;

import java.util.List;

import org.springframework.data.domain.Page;

import carevn.luv2code.ez_tro.dto.requests.RoomRequest;
import carevn.luv2code.ez_tro.dto.response.RoomResponse;

public interface RoomService {
    RoomResponse create(RoomRequest request);

    RoomResponse update(Integer id, RoomRequest request);

    void delete(Integer id);

    RoomResponse getById(Integer id);

    List<RoomResponse> getAll();

    Page<RoomResponse> getAllRoomsPaged(int page, int size);

    List<RoomResponse> getByBoardingHouseId(Integer boardingHouseId);
}
