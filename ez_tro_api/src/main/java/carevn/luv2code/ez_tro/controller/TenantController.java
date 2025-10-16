package carevn.luv2code.ez_tro.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.TenantRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.TenantResponse;
import carevn.luv2code.ez_tro.service.TenantService;
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
    public ApiResponse<TenantResponse> getById(@PathVariable Integer id) {
        TenantResponse response = tenantService.getById(id);
        return ApiResponse.<TenantResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get tenant successfully")
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
}
