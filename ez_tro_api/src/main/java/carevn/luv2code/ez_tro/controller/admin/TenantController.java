package carevn.luv2code.ez_tro.controller.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.TenantCreateRequest;
import carevn.luv2code.ez_tro.dto.requests.TenantUpdateRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.CurrentRentalInfoResponse;
import carevn.luv2code.ez_tro.dto.response.TenantDetailResponse;
import carevn.luv2code.ez_tro.dto.response.TenantResponse;
import carevn.luv2code.ez_tro.service.admin.TenantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST Controller quản lý người thuê (Tenant) phía admin/owner.
 *
 * <p>Controller cung cấp CRUD tenant, lấy chi tiết (bao gồm hợp đồng), và filter/phân trang.
 */
@RestController
@RequestMapping("/api/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;

    /**
     * Tạo mới tenant.
     *
     * @param request payload tạo tenant
     * @return response chứa tenant vừa tạo
     */
    @PostMapping
    public ApiResponse<TenantResponse> create(@Valid @RequestBody TenantCreateRequest request) {
        TenantResponse response = tenantService.create(request);
        return ApiResponse.<TenantResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Tenant created successfully")
                .result(response)
                .build();
    }

    /**
     * Cập nhật tenant theo id.
     *
     * @param id id tenant
     * @param request payload cập nhật tenant
     * @return response chứa tenant sau cập nhật
     */
    @PutMapping("/{id}")
    public ApiResponse<TenantResponse> update(
            @PathVariable Integer id, @Valid @RequestBody TenantUpdateRequest request) {
        TenantResponse response = tenantService.update(id, request);
        return ApiResponse.<TenantResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Tenant updated successfully")
                .result(response)
                .build();
    }

    /**
     * Xóa tenant theo id.
     *
     * @param id id tenant
     * @return response không có payload
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        tenantService.delete(id);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.NO_CONTENT.value())
                .message("Tenant deleted successfully")
                .build();
    }

    /**
     * Lấy chi tiết tenant (kèm contracts nếu có).
     *
     * @param id id tenant
     * @return response chứa tenant detail
     */
    @GetMapping("/{id}")
    public ApiResponse<TenantDetailResponse> getTenantDetail(@PathVariable Integer id) {
        TenantDetailResponse response = tenantService.getTenantDetail(id);
        return ApiResponse.<TenantDetailResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get tenant detail successfully")
                .result(response)
                .build();
    }

    /**
     * Lấy thông tin thuê hiện tại của tenant (hợp đồng/phòng hiện tại nếu có).
     *
     * @param id id tenant
     * @return response chứa thông tin thuê hiện tại
     */
    @GetMapping("/{id}/current-rental")
    public ApiResponse<CurrentRentalInfoResponse> getCurrentRentalInfo(@PathVariable Integer id) {
        CurrentRentalInfoResponse response = tenantService.getCurrentRentalInfo(id);
        return ApiResponse.<CurrentRentalInfoResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get tenant detail successfully")
                .result(response)
                .build();
    }

    /**
     * Lấy danh sách tenant.
     *
     * @return response chứa danh sách tenant
     */
    @GetMapping
    public ApiResponse<List<TenantResponse>> getAll() {
        List<TenantResponse> responses = tenantService.getAll();
        return ApiResponse.<List<TenantResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get all tenants successfully")
                .result(responses)
                .build();
    }

    /**
     * Lấy danh sách tenant phân trang.
     *
     * @param pageable tham số phân trang/sort
     * @return danh sách tenant phân trang
     */
    @GetMapping("/paged")
    public ResponseEntity<Page<TenantResponse>> getAllTenantsPaged(Pageable pageable) {
        Page<TenantResponse> tenants = tenantService.getAllTenantsPaged(pageable);
        return ResponseEntity.ok(tenants);
    }

    /**
     * Lọc tenant theo nhiều tiêu chí (từ khóa, giới tính, nghề nghiệp, ngày sinh, có hợp đồng active...).
     *
     * @param search từ khóa tìm kiếm
     * @param startDate ngày bắt đầu (yyyy-MM-dd) - tùy nghiệp vụ
     * @param endDate ngày kết thúc (yyyy-MM-dd) - tùy nghiệp vụ
     * @param gender giới tính
     * @param occupation nghề nghiệp
     * @param hasActiveContract lọc tenant có hợp đồng active hay không
     * @param page trang (0-based)
     * @param size kích thước trang
     * @return danh sách tenant phân trang
     */
    @GetMapping("/filter")
    public ResponseEntity<Page<TenantResponse>> filterTenants(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String occupation,
            @RequestParam(required = false) Boolean hasActiveContract,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<TenantResponse> result = tenantService.filterTenants(
                search, startDate, endDate, gender, occupation, hasActiveContract, page, size);
        return ResponseEntity.ok(result);
    }
}
