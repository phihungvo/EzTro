package carevn.luv2code.ez_tro.controller.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.RoomRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.RoomResponse;
import carevn.luv2code.ez_tro.service.admin.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @PostMapping
    public ApiResponse<RoomResponse> create(@Valid @RequestBody RoomRequest request) {
        RoomResponse response = roomService.create(request);
        return ApiResponse.<RoomResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Room created successfully")
                .result(response)
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<RoomResponse> update(@PathVariable Integer id, @Valid @RequestBody RoomRequest request) {
        RoomResponse response = roomService.update(id, request);
        return ApiResponse.<RoomResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Room updated successfully")
                .result(response)
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        roomService.delete(id);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.NO_CONTENT.value())
                .message("Room deleted successfully")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<RoomResponse> getById(@PathVariable Integer id) {
        RoomResponse response = roomService.getById(id);
        return ApiResponse.<RoomResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get room successfully")
                .result(response)
                .build();
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<RoomResponse>> getAllRoomsPaged(Pageable pageable) {
        return ResponseEntity.ok(roomService.getAllRoomsByRole(pageable));
    }

    @GetMapping
    public ApiResponse<List<RoomResponse>> getAll() {
        List<RoomResponse> responses = roomService.getAllByRole();
        return ApiResponse.<List<RoomResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get all rooms successfully")
                .result(responses)
                .build();
    }

    @GetMapping("/available")
    public ApiResponse<List<RoomResponse>> getAvailableRooms() {
        List<RoomResponse> responses = roomService.getAvailableRooms();
        return ApiResponse.<List<RoomResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get all rooms available successfully")
                .result(responses)
                .build();
    }

    @GetMapping("/by-boarding-house/{boardingHouseId}")
    public ApiResponse<List<RoomResponse>> getRoomsByBoardingHouse(@PathVariable Integer boardingHouseId) {
        List<RoomResponse> rooms = roomService.getByBoardingHouseId(boardingHouseId);
        return ApiResponse.<List<RoomResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get all rooms by boarding house successfully")
                .result(rooms)
                .build();
    }
}
