package carevn.luv2code.ez_tro.controller.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.AmenityRequest;
import carevn.luv2code.ez_tro.dto.response.AmenityResponse;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.service.admin.AmenityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/amenities")
@RequiredArgsConstructor
public class AmenityController {

    private final AmenityService amenityService;

    @PostMapping
    public ApiResponse<AmenityResponse> create(@Valid @RequestBody AmenityRequest request) {
        AmenityResponse response = amenityService.create(request);
        return ApiResponse.<AmenityResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Amenity created successfully")
                .result(response)
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<AmenityResponse> update(@PathVariable Integer id, @Valid @RequestBody AmenityRequest request) {
        AmenityResponse response = amenityService.update(id, request);
        return ApiResponse.<AmenityResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Amenity updated successfully")
                .result(response)
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        amenityService.delete(id);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.NO_CONTENT.value())
                .message("Amenity deleted successfully")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<AmenityResponse> getById(@PathVariable Integer id) {
        AmenityResponse response = amenityService.getById(id);
        return ApiResponse.<AmenityResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Amenity retrieved successfully")
                .result(response)
                .build();
    }

    @GetMapping
    public ApiResponse<List<AmenityResponse>> getAll() {
        List<AmenityResponse> response = amenityService.getAll();
        return ApiResponse.<List<AmenityResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("All amenities retrieved successfully")
                .result(response)
                .build();
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<AmenityResponse>> getAllAmenities(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Page<AmenityResponse> response = amenityService.getAllAmenitiesPaged(page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/boarding-house/{boardingHouseId}")
    public ApiResponse<List<AmenityResponse>> getByBoardingHouse(@PathVariable Integer boardingHouseId) {
        List<AmenityResponse> response = amenityService.getByBoardingHouse(boardingHouseId);
        return ApiResponse.<List<AmenityResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Amenities for boarding house retrieved successfully")
                .result(response)
                .build();
    }
}
