package carevn.luv2code.ez_tro.controller.admin;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.PaymentAllocateRequest;
import carevn.luv2code.ez_tro.dto.requests.PaymentConfirmRequest;
import carevn.luv2code.ez_tro.dto.requests.PaymentReceiveRequest;
import carevn.luv2code.ez_tro.dto.requests.PaymentReverseRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.PaymentListItemResponse;
import carevn.luv2code.ez_tro.dto.response.PaymentResponse;
import carevn.luv2code.ez_tro.service.admin.PaymentAllocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST Controller quản lý ghi nhận và phân bổ thanh toán (payments).
 *
 * <p>Các endpoint ở đây hỗ trợ:
 * <ul>
 *   <li>Ghi nhận tiền vào (receive) theo hợp đồng.</li>
 *   <li>Xác nhận (confirm) và phân bổ (allocate) vào các hóa đơn.</li>
 *   <li>Đảo thanh toán (reverse) khi cần hoàn/thu hồi.</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentAllocationService paymentAllocationService;

    /**
     * Ghi nhận một khoản thanh toán (thường ở trạng thái PENDING cho tới khi confirm).
     *
     * @param request payload nhận thanh toán
     * @return response chứa payment
     */
    @PostMapping
    public ApiResponse<PaymentResponse> receive(@Valid @RequestBody PaymentReceiveRequest request) {
        PaymentResponse response = paymentAllocationService.receivePayment(request);
        return ApiResponse.<PaymentResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Payment received successfully")
                .result(response)
                .build();
    }

    @GetMapping
    public ApiResponse<Page<PaymentListItemResponse>> filter(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) Integer contractId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<PaymentListItemResponse> response = paymentAllocationService.filterPayments(
                search, status, source, contractId, fromDate, toDate, page, size);
        return ApiResponse.<Page<PaymentListItemResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Filter payments successfully")
                .result(response)
                .build();
    }

    /**
     * Xác nhận một khoản thanh toán.
     *
     * @param id id payment
     * @param request payload confirm, có thể null
     * @return response chứa payment sau khi confirm
     */
    @PostMapping("/{id}/confirm")
    public ApiResponse<PaymentResponse> confirm(
            @PathVariable Integer id, @RequestBody(required = false) PaymentConfirmRequest request) {
        PaymentResponse response = paymentAllocationService.confirmPayment(id, request);
        return ApiResponse.<PaymentResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Payment confirmed successfully")
                .result(response)
                .build();
    }

    /**
     * Phân bổ một khoản thanh toán vào các hóa đơn của hợp đồng.
     *
     * @param id id payment
     * @param request payload phân bổ (manual allocations) - nếu null/empty service sẽ auto allocate theo rule
     * @return response chứa payment sau khi allocate
     */
    @PostMapping("/{id}/allocate")
    public ApiResponse<PaymentResponse> allocate(
            @PathVariable Integer id, @Valid @RequestBody(required = false) PaymentAllocateRequest request) {
        PaymentResponse response = paymentAllocationService.allocatePayment(id, request);
        return ApiResponse.<PaymentResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Payment allocated successfully")
                .result(response)
                .build();
    }

    /**
     * Đảo (reverse) một khoản thanh toán và các allocations liên quan.
     *
     * @param id id payment
     * @param request payload reverse (ví dụ: note) - có thể null
     * @return response chứa payment sau khi reverse
     */
    @PostMapping("/{id}/reverse")
    public ApiResponse<PaymentResponse> reverse(
            @PathVariable Integer id, @RequestBody(required = false) PaymentReverseRequest request) {
        PaymentResponse response = paymentAllocationService.reversePayment(id, request);
        return ApiResponse.<PaymentResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Payment reversed successfully")
                .result(response)
                .build();
    }

    /**
     * Lấy chi tiết payment theo id.
     *
     * @param id id payment
     * @return response chứa payment
     */
    @GetMapping("/{id}")
    public ApiResponse<PaymentResponse> get(@PathVariable Integer id) {
        PaymentResponse response = paymentAllocationService.getPayment(id);
        return ApiResponse.<PaymentResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get payment successfully")
                .result(response)
                .build();
    }

    /**
     * Xem chi tiết phân bổ của một payment: các allocations + tổng đã dùng/chưa dùng.
     */
    @GetMapping("/{id}/allocations")
    public ApiResponse<carevn.luv2code.ez_tro.dto.response.PaymentAllocationSummaryResponse> getAllocations(
            @PathVariable Integer id) {
        var response = paymentAllocationService.getPaymentAllocations(id);
        return ApiResponse.<carevn.luv2code.ez_tro.dto.response.PaymentAllocationSummaryResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get payment allocations successfully")
                .result(response)
                .build();
    }
}
