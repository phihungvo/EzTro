package carevn.luv2code.ez_tro.controller.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.UtilityRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.UtilityResponse;
import carevn.luv2code.ez_tro.service.admin.UtilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/utilities")
@RequiredArgsConstructor
public class UtilityController {

    private final UtilityService utilityService;

    @PostMapping
    public ApiResponse<UtilityResponse> create(@Valid @RequestBody UtilityRequest request) {
        UtilityResponse response = utilityService.create(request);
        return ApiResponse.<UtilityResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Tạo tiện ích thành công")
                .result(response)
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<UtilityResponse> update(@PathVariable Integer id, @Valid @RequestBody UtilityRequest request) {
        UtilityResponse response = utilityService.update(id, request);
        return ApiResponse.<UtilityResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Cập nhật tiện ích thành công")
                .result(response)
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        utilityService.delete(id);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.NO_CONTENT.value())
                .message("Xóa tiện ích thành công")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<UtilityResponse> getById(@PathVariable Integer id) {
        UtilityResponse response = utilityService.getById(id);
        return ApiResponse.<UtilityResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy tiện ích thành công")
                .result(response)
                .build();
    }

    @GetMapping
    public ApiResponse<List<UtilityResponse>> getAll() {
        List<UtilityResponse> responses = utilityService.getAll();
        return ApiResponse.<List<UtilityResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy tất cả tiện ích thành công")
                .result(responses)
                .build();
    }

    @GetMapping("/paged")
    public ApiResponse<Page<UtilityResponse>> getPaged(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Page<UtilityResponse> responses = utilityService.getAllPaged(page, size);
        return ApiResponse.<Page<UtilityResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy tiện ích phân trang thành công")
                .result(responses)
                .build();
    }

    @GetMapping("/boarding/{boardingHouseId}")
    public ApiResponse<List<UtilityResponse>> getByBoardingHouse(@PathVariable Integer boardingHouseId) {
        List<UtilityResponse> responses = utilityService.getByBoardingHouse(boardingHouseId);
        return ApiResponse.<List<UtilityResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy tiện ích theo khu nhà trọ thành công")
                .result(responses)
                .build();
    }

    @GetMapping("/active/boarding/{boardingHouseId}")
    public ApiResponse<Page<UtilityResponse>> getActiveByBoardingHouse(
            @PathVariable Integer boardingHouseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<UtilityResponse> responses = utilityService.getActiveByBoardingHouse(boardingHouseId, page, size);
        return ApiResponse.<Page<UtilityResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy tiện ích active theo khu nhà trọ thành công")
                .result(responses)
                .build();
    }
}
