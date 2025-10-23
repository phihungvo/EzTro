package carevn.luv2code.ez_tro.service.admin;

import java.util.List;

import carevn.luv2code.ez_tro.dto.response.RoomAmenityResponse;

public interface RoomAmenityService {
    List<RoomAmenityResponse> getByBoardingHouseId(Integer boardingHouseId);
}
