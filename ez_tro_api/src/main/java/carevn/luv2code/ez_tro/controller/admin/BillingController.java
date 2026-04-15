package carevn.luv2code.ez_tro.controller.admin;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.InvoiceFinalizeRequest;
import carevn.luv2code.ez_tro.dto.requests.InvoicePreviewRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.BillResponse;
import carevn.luv2code.ez_tro.dto.response.InvoicePreviewResponse;
import carevn.luv2code.ez_tro.service.admin.BillingOrchestratorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST Controller điều phối nghiệp vụ tính tiền/lập hóa đơn (billing).
 *
 * <p>Các endpoint ở đây cung cấp:
 * <ul>
 *   <li>Preview: dựng trước invoice theo dữ liệu hiện tại (chưa ghi DB).</li>
 *   <li>Finalize: chốt invoice và tạo/cập nhật bill + bill lines trong DB.</li>
 * </ul>
 *
 * <p>Nghiệp vụ chi tiết nằm ở {@link BillingOrchestratorService}.
 */
@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingOrchestratorService billingOrchestratorService;

    /**
     * Preview hóa đơn theo hợp đồng và kỳ tính.
     *
     * @param request payload preview invoice
     * @return response chứa dữ liệu preview (bill lines + tổng tiền)
     */
    @PostMapping("/preview")
    public ApiResponse<InvoicePreviewResponse> preview(@Valid @RequestBody InvoicePreviewRequest request) {
        InvoicePreviewResponse response = billingOrchestratorService.previewInvoice(request);
        return ApiResponse.<InvoicePreviewResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Preview invoice successfully")
                .result(response)
                .build();
    }

    /**
     * Finalize (chốt) invoice và ghi hóa đơn vào DB.
     *
     * @param request payload finalize invoice
     * @return response chứa bill đã tạo/cập nhật
     */
    @PostMapping("/finalize")
    public ApiResponse<BillResponse> finalizeInvoice(@Valid @RequestBody InvoiceFinalizeRequest request) {
        BillResponse response = billingOrchestratorService.finalizeInvoice(request);
        return ApiResponse.<BillResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Finalize invoice successfully")
                .result(response)
                .build();
    }
}
