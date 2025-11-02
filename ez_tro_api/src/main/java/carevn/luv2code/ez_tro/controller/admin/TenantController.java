package carevn.luv2code.ez_tro.controller.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.TenantRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.CurrentRentalInfoResponse;
import carevn.luv2code.ez_tro.dto.response.TenantDetailResponse;
import carevn.luv2code.ez_tro.dto.response.TenantResponse;
import carevn.luv2code.ez_tro.service.admin.TenantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;

    @PostMapping
    public ApiResponse<TenantResponse> create(@Valid @RequestBody TenantRequest request) {
        TenantResponse response = tenantService.create(request);
        return ApiResponse.<TenantResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Tenant created successfully")
                .result(response)
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<TenantResponse> update(@PathVariable Integer id, @Valid @RequestBody TenantRequest request) {
        TenantResponse response = tenantService.update(id, request);
        return ApiResponse.<TenantResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Tenant updated successfully")
                .result(response)
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        tenantService.delete(id);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.NO_CONTENT.value())
                .message("Tenant deleted successfully")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<TenantDetailResponse> getTenantDetail(@PathVariable Integer id) {
        TenantDetailResponse response = tenantService.getTenantDetail(id);
        return ApiResponse.<TenantDetailResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get tenant detail successfully")
                .result(response)
                .build();
    }

    @GetMapping("/{id}/current-rental")
    public ApiResponse<CurrentRentalInfoResponse> getCurrentRentalInfo(@PathVariable Integer id) {
        CurrentRentalInfoResponse response = tenantService.getCurrentRentalInfo(id);
        return ApiResponse.<CurrentRentalInfoResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get tenant detail successfully")
                .result(response)
                .build();
    }

    @GetMapping
    public ApiResponse<List<TenantResponse>> getAll() {
        List<TenantResponse> responses = tenantService.getAll();
        return ApiResponse.<List<TenantResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get all tenants successfully")
                .result(responses)
                .build();
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<TenantResponse>> getAllTenantsPaged(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Page<TenantResponse> tenants = tenantService.getAllTenantsPaged(page, size);
        return ResponseEntity.ok(tenants);
    }

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
