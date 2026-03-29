package carevn.luv2code.ez_tro.controller.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.BillRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.BillResponse;
import carevn.luv2code.ez_tro.service.admin.BillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST Controller quản lý Hóa đơn (Bill) phía admin/owner.
 *
 * <p>Controller nhận request từ client, validate (@Valid) và ủy quyền nghiệp vụ cho {@link BillService}.
 * Response được bọc bởi {@link ApiResponse} để thống nhất format.
 */
@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;

    /**
     * Tạo mới hóa đơn cho một hợp đồng/phòng.
     *
     * @param request payload tạo hóa đơn
     * @return response chứa hóa đơn vừa tạo
     */
    @PostMapping
    public ApiResponse<BillResponse> create(@Valid @RequestBody BillRequest request) {
        BillResponse response = billService.create(request);
        return ApiResponse.<BillResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Bill created successfully")
                .result(response)
                .build();
    }

    /**
     * Cập nhật hóa đơn theo id.
     *
     * @param id id hóa đơn
     * @param request payload cập nhật
     * @return response chứa hóa đơn sau khi cập nhật
     */
    @PutMapping("/{id}")
    public ApiResponse<BillResponse> update(@PathVariable Integer id, @Valid @RequestBody BillRequest request) {
        BillResponse response = billService.update(id, request);
        return ApiResponse.<BillResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Bill updated successfully")
                .result(response)
                .build();
    }

    /**
     * Xóa hóa đơn theo id.
     *
     * @param id id hóa đơn
     * @return response không có payload
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        billService.delete(id);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.NO_CONTENT.value())
                .message("Bill deleted successfully")
                .build();
    }

    /**
     * Hủy hóa đơn theo id (không xóa dữ liệu).
     *
     * @param id id hóa đơn
     * @return response chứa bill sau khi hủy
     */
    @PostMapping("/{id}/cancel")
    public ApiResponse<BillResponse> cancel(@PathVariable Integer id) {
        BillResponse response = billService.cancel(id);
        return ApiResponse.<BillResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Bill cancelled successfully")
                .result(response)
                .build();
    }

    /**
     * Lấy chi tiết hóa đơn theo id.
     *
     * @param id id hóa đơn
     * @return response chứa hóa đơn
     */
    @GetMapping("/{id}")
    public ApiResponse<BillResponse> getById(@PathVariable Integer id) {
        BillResponse response = billService.getById(id);
        return ApiResponse.<BillResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get bill successfully")
                .result(response)
                .build();
    }

    /**
     * Lấy danh sách hóa đơn.
     *
     * @return response chứa danh sách hóa đơn
     */
    @GetMapping
    public ApiResponse<List<BillResponse>> getAll() {
        List<BillResponse> responses = billService.getAll();
        return ApiResponse.<List<BillResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get all bills successfully")
                .result(responses)
                .build();
    }

    //    @GetMapping
    //    public ApiResponse<List<BillResponse>> getBills(Authentication authentication) {
    //        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
    //        Integer tenantId = userDetails.getId();
    //
    //        List<BillResponse> bills = billService.getBillsByTenant(tenantId);
    //
    //        return ApiResponse.<List<BillResponse>>builder()
    //                .code(HttpStatus.OK.value())
    //                .message("Lấy danh sách hóa đơn thành công")
    //                .result(bills)
    //                .build();
    //    }

    /**
     * Lọc hóa đơn theo nhiều tiêu chí (từ khóa, trạng thái, tháng/năm, hợp đồng...).
     *
     * @param search từ khóa (billCode/billTitle/tên người thuê/số phòng...)
     * @param status trạng thái bill (UNPAID/PAID/OVERDUE/...)
     * @param paid lọc đã thanh toán hay chưa
     * @param month tháng
     * @param year năm
     * @param contractId id hợp đồng
     * @param page trang (0-based)
     * @param size kích thước trang
     * @return response chứa danh sách phân trang
     */
    @GetMapping("/filter")
    public ApiResponse<Page<BillResponse>> filterBills(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean paid,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer contractId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<BillResponse> result = billService.filterBills(search, status, paid, month, year, contractId, page, size);
        return ApiResponse.<Page<BillResponse>>builder()
                .code(200)
                .message("Lọc hóa đơn thành công")
                .result(result)
                .build();
    }
}
