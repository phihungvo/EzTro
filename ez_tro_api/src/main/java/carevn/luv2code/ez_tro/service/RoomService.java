package carevn.luv2code.ez_tro.service;

import java.util.List;

import carevn.luv2code.ez_tro.dto.requests.RoomRequest;
import carevn.luv2code.ez_tro.dto.response.RoomResponse;

public interface RoomService {
    RoomResponse create(RoomRequest request);

    RoomResponse update(Integer id, RoomRequest request);

    void delete(Integer id);

    RoomResponse getById(Integer id);

    List<RoomResponse> getAll();
}
