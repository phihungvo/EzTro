package carevn.luv2code.ez_tro.service.admin;

import java.util.List;

import org.springframework.data.domain.Page;

import carevn.luv2code.ez_tro.dto.requests.RoomUtilityRequest;
import carevn.luv2code.ez_tro.dto.response.RoomUtilityResponse;

public interface RoomUtilityService {
    RoomUtilityResponse create(RoomUtilityRequest request);

    RoomUtilityResponse update(Integer roomId, Integer utilityId, RoomUtilityRequest request);

    void delete(Integer roomId, Integer utilityId);

    RoomUtilityResponse getById(Integer roomId, Integer utilityId);

    List<RoomUtilityResponse> getByRoomId(Integer roomId);

    List<RoomUtilityResponse> getActiveByRoomId(Integer roomId);

    List<RoomUtilityResponse> getByUtilityId(Integer utilityId);

    Page<RoomUtilityResponse> getByRoomIdPaged(Integer roomId, int page, int size);
}
