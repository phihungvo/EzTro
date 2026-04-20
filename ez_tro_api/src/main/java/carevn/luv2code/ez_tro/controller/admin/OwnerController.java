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

/**
 * REST Controller quản lý thông tin chủ trọ (owner).
 *
 * <p>Các endpoint hỗ trợ lấy danh sách owner, CRUD owner và lấy profile của owner hiện tại.
 */
@RestController
@RequestMapping("/api/owners")
@RequiredArgsConstructor
public class OwnerController {

    private final OwnerService ownerService;

    /**
     * Lấy danh sách owner phân trang.
     *
     * @param page trang (0-based)
     * @param size kích thước trang
     * @return response chứa danh sách owner
     */
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

    /**
     * Lấy profile của owner hiện tại.
     *
     * @return response chứa thông tin owner
     */
    @GetMapping("/me")
    public ApiResponse<OwnerResponse> getMyProfile() {
        return ApiResponse.<OwnerResponse>builder()
                .code(200)
                .message("Thông tin cá nhân")
                .result(ownerService.getMyProfile())
                .build();
    }

    /**
     * Tạo mới owner.
     *
     * @param req payload tạo owner
     * @return response chứa owner vừa tạo
     */
    @PostMapping
    public ApiResponse<OwnerResponse> create(@Valid @RequestBody OwnerRequest req) {
        return ApiResponse.<OwnerResponse>builder()
                .code(201)
                .message("Tạo chủ trọ thành công")
                .result(ownerService.create(req))
                .build();
    }

    /**
     * Cập nhật owner theo id.
     *
     * @param id id owner
     * @param req payload cập nhật owner
     * @return response chứa owner sau cập nhật
     */
    @PutMapping("/{id}")
    public ApiResponse<OwnerResponse> update(@PathVariable Integer id, @Valid @RequestBody OwnerRequest req) {
        return ApiResponse.<OwnerResponse>builder()
                .code(200)
                .message("Cập nhật thành công")
                .result(ownerService.update(id, req))
                .build();
    }

    /**
     * Xóa owner theo id.
     *
     * @param id id owner
     * @return response không có payload
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        ownerService.delete(id);
        return ApiResponse.<Void>builder()
                .code(204)
                .message("Xóa chủ trọ thành công")
                .build();
    }

    /**
     * Lấy thông tin owner theo id.
     *
     * @param id id owner
     * @return response chứa owner
     */
    @GetMapping("/{id}")
    public ApiResponse<OwnerResponse> getById(@PathVariable Integer id) {
        return ApiResponse.<OwnerResponse>builder()
                .code(200)
                .message("Lấy thông tin chủ trọ")
                .result(ownerService.getById(id))
                .build();
    }
}
