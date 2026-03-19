package carevn.luv2code.ez_tro.controller.admin;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.SystemConfigRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.SystemConfigResponse;
import carevn.luv2code.ez_tro.service.admin.SystemConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/system-configs")
@RequiredArgsConstructor
public class SystemConfigController {

    private final SystemConfigService systemConfigService;

    @PostMapping
    public ApiResponse<SystemConfigResponse> create(@Valid @RequestBody SystemConfigRequest request) {
        return ApiResponse.<SystemConfigResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("System config created successfully")
                .result(systemConfigService.create(request))
                .build();
    }

    @GetMapping
    public ApiResponse<List<SystemConfigResponse>> getAll() {
        return ApiResponse.<List<SystemConfigResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get all system configs successfully")
                .result(systemConfigService.getAll())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<SystemConfigResponse> getById(@PathVariable Integer id) {
        return ApiResponse.<SystemConfigResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get system config successfully")
                .result(systemConfigService.getById(id))
                .build();
    }

    @GetMapping("/key/{key}")
    public ApiResponse<SystemConfigResponse> getByKey(@PathVariable String key) {
        return ApiResponse.<SystemConfigResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get system config by key successfully")
                .result(systemConfigService.getByKey(key))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<SystemConfigResponse> update(
            @PathVariable Integer id, @Valid @RequestBody SystemConfigRequest request) {
        return ApiResponse.<SystemConfigResponse>builder()
                .code(HttpStatus.OK.value())
                .message("System config updated successfully")
                .result(systemConfigService.update(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        systemConfigService.delete(id);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("System config deleted successfully")
                .build();
    }
}
