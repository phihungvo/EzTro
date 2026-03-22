package carevn.luv2code.ez_tro.controller.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.PropertyAssetRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.PropertyAssetResponse;
import carevn.luv2code.ez_tro.enums.PropertyAssetCategory;
import carevn.luv2code.ez_tro.enums.PropertyAssetCondition;
import carevn.luv2code.ez_tro.enums.PropertyAssetStatus;
import carevn.luv2code.ez_tro.service.admin.PropertyAssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/property-assets")
@RequiredArgsConstructor
public class PropertyAssetController {

    private final PropertyAssetService propertyAssetService;

    @PostMapping
    public ApiResponse<PropertyAssetResponse> create(@Valid @RequestBody PropertyAssetRequest request) {
        return ApiResponse.<PropertyAssetResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Tạo tài sản thành công")
                .result(propertyAssetService.create(request))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<PropertyAssetResponse> update(
            @PathVariable Integer id, @Valid @RequestBody PropertyAssetRequest request) {
        return ApiResponse.<PropertyAssetResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Cập nhật tài sản thành công")
                .result(propertyAssetService.update(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        propertyAssetService.delete(id);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.NO_CONTENT.value())
                .message("Xóa tài sản thành công")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<PropertyAssetResponse> getById(@PathVariable Integer id) {
        return ApiResponse.<PropertyAssetResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy chi tiết tài sản thành công")
                .result(propertyAssetService.getById(id))
                .build();
    }

    @GetMapping
    public ApiResponse<List<PropertyAssetResponse>> getAll() {
        return ApiResponse.<List<PropertyAssetResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách tài sản thành công")
                .result(propertyAssetService.getAllByRole())
                .build();
    }

    @GetMapping("/room/{roomId}")
    public ApiResponse<List<PropertyAssetResponse>> getByRoomId(@PathVariable Integer roomId) {
        return ApiResponse.<List<PropertyAssetResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy tài sản theo phòng thành công")
                .result(propertyAssetService.getByRoomId(roomId))
                .build();
    }

    @GetMapping("/filter")
    public ApiResponse<Page<PropertyAssetResponse>> filter(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) PropertyAssetCategory category,
            @RequestParam(required = false) PropertyAssetStatus status,
            @RequestParam(required = false) PropertyAssetCondition condition,
            @RequestParam(required = false) Integer boardingHouseId,
            @RequestParam(required = false) Integer roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        Pageable pageable = createPageable(page, size, sort);
        Page<PropertyAssetResponse> result =
                propertyAssetService.filter(search, category, status, condition, boardingHouseId, roomId, pageable);

        return ApiResponse.<Page<PropertyAssetResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lọc tài sản thành công")
                .result(result)
                .build();
    }

    private Pageable createPageable(int page, int size, String sort) {
        String[] sortParts = sort.split(",");
        Sort.Direction direction =
                sortParts.length > 1 ? Sort.Direction.fromString(sortParts[1].trim()) : Sort.Direction.DESC;
        String sortField = sortParts[0].trim();
        return PageRequest.of(page, size, Sort.by(direction, sortField));
    }
}
