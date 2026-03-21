package carevn.luv2code.ez_tro.controller.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.BoardingHouseRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.BoardingHouseResponse;
import carevn.luv2code.ez_tro.dto.response.UtilityResponse;
import carevn.luv2code.ez_tro.service.admin.BoardingHouseService;
import carevn.luv2code.ez_tro.service.admin.UtilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/boarding-houses")
@RequiredArgsConstructor
public class BoardingHouseController {

    private final BoardingHouseService boardingHouseService;
    private final UtilityService utilityService;

    @PostMapping
    public ApiResponse<BoardingHouseResponse> create(@Valid @RequestBody BoardingHouseRequest request) {
        BoardingHouseResponse response = boardingHouseService.create(request);
        return ApiResponse.<BoardingHouseResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Boarding house created successfully")
                .result(response)
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<BoardingHouseResponse> update(
            @PathVariable Integer id, @Valid @RequestBody BoardingHouseRequest request) {
        BoardingHouseResponse response = boardingHouseService.update(id, request);
        return ApiResponse.<BoardingHouseResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Boarding house updated successfully")
                .result(response)
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        boardingHouseService.delete(id);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.NO_CONTENT.value())
                .message("Boarding house deleted successfully")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<BoardingHouseResponse> get(@PathVariable Integer id) {
        BoardingHouseResponse response = boardingHouseService.getById(id);
        return ApiResponse.<BoardingHouseResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get boarding house successfully")
                .result(response)
                .build();
    }

    @GetMapping
    public ApiResponse<List<BoardingHouseResponse>> getAll() {
        List<BoardingHouseResponse> responses = boardingHouseService.getAllByRole();
        return ApiResponse.<List<BoardingHouseResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get all boarding houses successfully")
                .result(responses)
                .build();
    }

    @GetMapping("/owner")
    public ApiResponse<List<BoardingHouseResponse>> getAllForOwner() {
        List<BoardingHouseResponse> responses = boardingHouseService.getAllForOwner();
        return ApiResponse.<List<BoardingHouseResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get all boarding houses for owner successfully")
                .result(responses)
                .build();
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<BoardingHouseResponse>> getAllPagedByRole(Pageable pageable) {
        Page<BoardingHouseResponse> responses = boardingHouseService.getAllPagedByRole(pageable);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}/utilities")
    public ApiResponse<List<UtilityResponse>> getUtilities(@PathVariable("id") Integer id) {
        List<UtilityResponse> utilities = utilityService.getUtilitiesByBoardingHouse(id);

        return ApiResponse.<List<UtilityResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get utilities by boarding house successfully")
                .result(utilities)
                .build();
    }
}
