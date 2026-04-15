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

/**
 * REST Controller quản lý tài sản (Property Asset) thuộc khu nhà trọ/phòng.
 *
 * <p>Controller hỗ trợ CRUD tài sản, truy vấn theo phòng và filter phân trang.
 */
@RestController
@RequestMapping("/api/property-assets")
@RequiredArgsConstructor
public class PropertyAssetController {

    private final PropertyAssetService propertyAssetService;

    /**
     * Tạo mới tài sản.
     *
     * @param request payload tạo tài sản
     * @return response chứa tài sản vừa tạo
     */
    @PostMapping
    public ApiResponse<PropertyAssetResponse> create(@Valid @RequestBody PropertyAssetRequest request) {
        return ApiResponse.<PropertyAssetResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Tạo tài sản thành công")
                .result(propertyAssetService.create(request))
                .build();
    }

    /**
     * Cập nhật tài sản theo id.
     *
     * @param id id tài sản
     * @param request payload cập nhật
     * @return response chứa tài sản sau khi cập nhật
     */
    @PutMapping("/{id}")
    public ApiResponse<PropertyAssetResponse> update(
            @PathVariable Integer id, @Valid @RequestBody PropertyAssetRequest request) {
        return ApiResponse.<PropertyAssetResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Cập nhật tài sản thành công")
                .result(propertyAssetService.update(id, request))
                .build();
    }

    /**
     * Xóa tài sản theo id.
     *
     * @param id id tài sản
     * @return response không có payload
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        propertyAssetService.delete(id);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.NO_CONTENT.value())
                .message("Xóa tài sản thành công")
                .build();
    }

    /**
     * Lấy chi tiết tài sản theo id.
     *
     * @param id id tài sản
     * @return response chứa tài sản
     */
    @GetMapping("/{id}")
    public ApiResponse<PropertyAssetResponse> getById(@PathVariable Integer id) {
        return ApiResponse.<PropertyAssetResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy chi tiết tài sản thành công")
                .result(propertyAssetService.getById(id))
                .build();
    }

    /**
     * Lấy danh sách tài sản theo role hiện tại (admin/owner).
     *
     * @return response chứa danh sách tài sản
     */
    @GetMapping
    public ApiResponse<List<PropertyAssetResponse>> getAll() {
        return ApiResponse.<List<PropertyAssetResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách tài sản thành công")
                .result(propertyAssetService.getAllByRole())
                .build();
    }

    /**
     * Lấy danh sách tài sản theo phòng.
     *
     * @param roomId id phòng
     * @return response chứa danh sách tài sản
     */
    @GetMapping("/room/{roomId}")
    public ApiResponse<List<PropertyAssetResponse>> getByRoomId(@PathVariable Integer roomId) {
        return ApiResponse.<List<PropertyAssetResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy tài sản theo phòng thành công")
                .result(propertyAssetService.getByRoomId(roomId))
                .build();
    }

    /**
     * Lọc tài sản theo nhiều tiêu chí và trả về phân trang.
     *
     * @param search từ khóa tìm kiếm
     * @param category danh mục tài sản
     * @param status trạng thái tài sản
     * @param condition tình trạng tài sản
     * @param boardingHouseId id khu nhà trọ
     * @param roomId id phòng
     * @param page trang (0-based)
     * @param size kích thước trang
     * @param sort sort dạng "field,direction"
     * @return response chứa kết quả phân trang
     */
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
