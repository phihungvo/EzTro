package carevn.luv2code.ez_tro.controller.admin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.OwnerRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.OwnerResponse;
import carevn.luv2code.ez_tro.service.admin.OwnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/owners")
@RequiredArgsConstructor
public class OwnerController {

    private final OwnerService ownerService;

    @GetMapping
    public ApiResponse<Page<OwnerResponse>> getAll(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createAt").descending());
        return ApiResponse.<Page<OwnerResponse>>builder()
                .code(200)
                .message("Lấy danh sách chủ trọ thành công")
                .result(ownerService.getAll(pageable))
                .build();
    }

    @GetMapping("/me")
    public ApiResponse<OwnerResponse> getMyProfile() {
        return ApiResponse.<OwnerResponse>builder()
                .code(200)
                .message("Thông tin cá nhân")
                .result(ownerService.getMyProfile())
                .build();
    }

    @PostMapping
    public ApiResponse<OwnerResponse> create(@Valid @RequestBody OwnerRequest req) {
        return ApiResponse.<OwnerResponse>builder()
                .code(201)
                .message("Tạo chủ trọ thành công")
                .result(ownerService.create(req))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<OwnerResponse> update(@PathVariable Integer id, @Valid @RequestBody OwnerRequest req) {
        return ApiResponse.<OwnerResponse>builder()
                .code(200)
                .message("Cập nhật thành công")
                .result(ownerService.update(id, req))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        ownerService.delete(id);
        return ApiResponse.<Void>builder()
                .code(204)
                .message("Xóa chủ trọ thành công")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<OwnerResponse> getById(@PathVariable Integer id) {
        return ApiResponse.<OwnerResponse>builder()
                .code(200)
                .message("Lấy thông tin chủ trọ")
                .result(ownerService.getById(id))
                .build();
    }
}
