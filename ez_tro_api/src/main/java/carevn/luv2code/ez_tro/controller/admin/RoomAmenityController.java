package carevn.luv2code.ez_tro.controller.admin;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.RoomAmenityResponse;
import carevn.luv2code.ez_tro.service.admin.RoomAmenityService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/room-amenities")
@RequiredArgsConstructor
public class RoomAmenityController {

    private final RoomAmenityService roomAmenityService;

    @GetMapping("/boarding-house/{boardingHouseId}")
    public ApiResponse<List<RoomAmenityResponse>> getByBoardingHouse(@PathVariable Integer boardingHouseId) {
        List<RoomAmenityResponse> response = roomAmenityService.getByBoardingHouseId(boardingHouseId);
        return ApiResponse.<List<RoomAmenityResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Room amenities retrieved successfully")
                .result(response)
                .build();
    }
}
