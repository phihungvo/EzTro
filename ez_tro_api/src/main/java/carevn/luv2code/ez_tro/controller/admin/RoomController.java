package carevn.luv2code.ez_tro.controller.admin;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.RoomRequest;
import carevn.luv2code.ez_tro.dto.response.*;
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

    @GetMapping("/filter")
    public ResponseEntity<Page<RoomResponse>> filterRooms(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer boardingHouseId,
            @RequestParam(required = false) Integer minArea,
            @RequestParam(required = false) Integer maxArea,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean hasActiveContract,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        Pageable pageable = createPageable(page, size, sort);

        Page<RoomResponse> result = roomService.filterRooms(
                search, status, boardingHouseId, minArea, maxArea, minPrice, maxPrice, hasActiveContract, pageable);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/rented-active")
    public ResponseEntity<Page<RentedRoomContextResponse>> getRentedActiveRooms(
            @RequestParam(required = false) Integer boardingHouseId, // lọc theo khu nhà
            @RequestParam(required = false) Integer floor, // lọc theo tầng (tùy chọn)
            @RequestParam int month, // tháng cần kiểm tra bill
            @RequestParam int year, // năm cần kiểm tra bill
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("roomNumber").ascending());

        Page<RentedRoomContextResponse> result =
                roomService.getRentedActiveRooms(boardingHouseId, floor, month, year, pageable);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{roomId}/rented-context")
    public ResponseEntity<RentedRoomDetailResponse> getRentedRoomDetail(
            @PathVariable Integer roomId, @RequestParam int month, @RequestParam int year) {

        RentedRoomDetailResponse response = roomService.getRentedRoomDetail(roomId, month, year);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{roomId}/creator-bill-context")
    public ResponseEntity<ApiResponse<CreatorBillContextResponse>> getCreatorBillContext(
            @PathVariable Integer roomId, @RequestParam int month, @RequestParam int year) {

        CreatorBillContextResponse result = roomService.getCreatorBillContext(roomId, month, year);
        return ResponseEntity.ok(ApiResponse.<CreatorBillContextResponse>builder()
                .code(200)
                .message("Lấy dữ liệu tạo hoá đơn thành công")
                .result(result)
                .build());
    }

    // Lấy danh sách phòng theo kỳ (tháng, năm) và khu nhà, bao gồm thông tin hợp đồng, hóa đơn, tiền điện nước nếu có
    @GetMapping("/boarding-houses/{boardingHouseId}/rooms-period-summary")
    public ResponseEntity<ApiResponse<List<RoomPeriodSummaryResponse>>> getRoomsPeriodSummary(
            @PathVariable Integer boardingHouseId, @RequestParam int month, @RequestParam int year) {

        List<RoomPeriodSummaryResponse> result =
                roomService.getRoomsSummaryByBoardingHouseAndPeriod(boardingHouseId, month, year);

        return ResponseEntity.ok(ApiResponse.<List<RoomPeriodSummaryResponse>>builder()
                .code(200)
                .message("Lấy danh sách phòng theo kỳ thành công")
                .result(result)
                .build());
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

    @GetMapping("/by-building/{buildingId}")
    public ApiResponse<List<RoomResponse>> getRoomsByBuilding(@PathVariable Integer buildingId) {
        List<RoomResponse> rooms = roomService.getByBuildingId(buildingId);
        return ApiResponse.<List<RoomResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get all rooms by building successfully")
                .result(rooms)
                .build();
    }

    private Pageable createPageable(int page, int size, String sort) {
        String[] sortParts = sort.split(",");
        Sort.Direction direction = Sort.Direction.fromString(sortParts[1].trim());
        Sort sortBy = Sort.by(direction, sortParts[0].trim());
        return PageRequest.of(page, size, sortBy);
    }
}
