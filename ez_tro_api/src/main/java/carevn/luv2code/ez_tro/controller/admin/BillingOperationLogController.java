package carevn.luv2code.ez_tro.controller.admin;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.BillingOperationLogResponse;
import carevn.luv2code.ez_tro.enums.BillingAuditTargetType;
import carevn.luv2code.ez_tro.service.admin.BillingOperationLogService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/billing-audit")
@RequiredArgsConstructor
public class BillingOperationLogController {

    private final BillingOperationLogService billingOperationLogService;

    @GetMapping
    public ApiResponse<List<BillingOperationLogResponse>> getLogs(
            @RequestParam(required = false) Integer contractId,
            @RequestParam(required = false) BillingAuditTargetType targetType,
            @RequestParam(required = false) Integer targetId) {
        List<BillingOperationLogResponse> response =
                billingOperationLogService.getLogs(contractId, targetType, targetId);
        return ApiResponse.<List<BillingOperationLogResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get billing audit logs successfully")
                .result(response)
                .build();
    }
}
