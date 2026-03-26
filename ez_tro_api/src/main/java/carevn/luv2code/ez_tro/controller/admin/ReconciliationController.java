package carevn.luv2code.ez_tro.controller.admin;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.ReconciliationReportResponse;
import carevn.luv2code.ez_tro.service.admin.PaymentAllocationService;
import lombok.RequiredArgsConstructor;

/**
 * REST Controller dựng báo cáo đối soát (reconciliation) cho hợp đồng.
 *
 * <p>Báo cáo tổng hợp: tổng tiền hóa đơn, tổng tiền đã nhận, tổng đã phân bổ, công nợ và credit.
 */
@RestController
@RequestMapping("/api/reconciliation")
@RequiredArgsConstructor
public class ReconciliationController {

    private final PaymentAllocationService paymentAllocationService;

    /**
     * Lấy báo cáo đối soát theo hợp đồng.
     *
     * @param contractId id hợp đồng
     * @return response chứa báo cáo đối soát
     */
    @GetMapping("/contracts/{contractId}")
    public ApiResponse<ReconciliationReportResponse> getContractReport(@PathVariable Integer contractId) {
        ReconciliationReportResponse response = paymentAllocationService.getReconciliationReport(contractId);
        return ApiResponse.<ReconciliationReportResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Reconciliation report generated successfully")
                .result(response)
                .build();
    }
}
