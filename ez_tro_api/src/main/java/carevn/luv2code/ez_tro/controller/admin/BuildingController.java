package carevn.luv2code.ez_tro.controller.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.BuildingRequest;
import carevn.luv2code.ez_tro.dto.response.BuildingResponse;
import carevn.luv2code.ez_tro.service.admin.BuildingService;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST Controller quản lý Tòa nhà (Building) thuộc khu nhà trọ.
 *
 * <p>Controller cung cấp CRUD building và các endpoint truy vấn theo role (admin/owner),
 * đồng thời hỗ trợ phân trang.
 */
@RestController
@RequestMapping("/api/buildings")
@RequiredArgsConstructor
public class BuildingController {

    private final BuildingService buildingService;

    /**
     * Lấy danh sách building phân trang theo role hiện tại (admin: tất cả, owner: của mình).
     *
     * @param pageable tham số phân trang/sort
     * @return danh sách building phân trang
     */
    @GetMapping("/paged-by-role")
    public ResponseEntity<Page<BuildingResponse>> getAllBuildingsByRole(
            @Parameter(description = "Phân trang") Pageable pageable) {
        return ResponseEntity.ok(buildingService.getAllBuildingsByRole(pageable));
    }

    /**
     * Tạo mới building.
     *
     * @param request payload tạo building
     * @return building vừa tạo
     */
    @PostMapping
    public ResponseEntity<BuildingResponse> create(@Valid @RequestBody BuildingRequest request) {
        return ResponseEntity.ok(buildingService.create(request));
    }

    /**
     * Cập nhật building theo id.
     *
     * @param id id building
     * @param request payload cập nhật
     * @return building sau khi cập nhật
     */
    @PutMapping("/{id}")
    public ResponseEntity<BuildingResponse> update(
            @PathVariable Integer id, @Valid @RequestBody BuildingRequest request) {
        return ResponseEntity.ok(buildingService.update(id, request));
    }

    /**
     * Xóa building theo id.
     *
     * @param id id building
     * @return response 204 nếu xóa thành công
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        buildingService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Lấy chi tiết building theo id.
     *
     * @param id id building
     * @return building detail
     */
    @GetMapping("/{id}")
    public ResponseEntity<BuildingResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(buildingService.getById(id));
    }

    /**
     * Lấy danh sách building (không phân trang) theo role hiện tại.
     *
     * @return danh sách building
     */
    @GetMapping
    public ResponseEntity<List<BuildingResponse>> getAll() {
        return ResponseEntity.ok(buildingService.getAll());
    }

    /**
     * Lấy danh sách building phân trang theo page/size.
     *
     * @param page trang (0-based)
     * @param size kích thước trang
     * @return danh sách building phân trang
     */
    @GetMapping("/paged")
    public ResponseEntity<Page<BuildingResponse>> getAllBuildings(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Page<BuildingResponse> buildings = buildingService.getAllBuildingsPaged(page, size);
        return ResponseEntity.ok(buildings);
    }

    /**
     * Lấy danh sách building theo khu nhà trọ.
     *
     * @param boardingHouseId id khu nhà trọ
     * @return danh sách building
     */
    @GetMapping("/boarding-house/{boardingHouseId}")
    public ResponseEntity<List<BuildingResponse>> getByBoardingHouse(@PathVariable Integer boardingHouseId) {
        return ResponseEntity.ok(buildingService.getByBoardingHouse(boardingHouseId));
    }
}
