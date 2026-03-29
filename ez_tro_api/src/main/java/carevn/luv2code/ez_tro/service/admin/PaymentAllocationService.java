package carevn.luv2code.ez_tro.service.admin;

import java.time.LocalDate;

import org.springframework.data.domain.Page;

import carevn.luv2code.ez_tro.dto.requests.PaymentAllocateRequest;
import carevn.luv2code.ez_tro.dto.requests.PaymentReceiveRequest;
import carevn.luv2code.ez_tro.dto.requests.PaymentReverseRequest;
import carevn.luv2code.ez_tro.dto.response.CreditLedgerReportResponse;
import carevn.luv2code.ez_tro.dto.response.DebtAgingReportResponse;
import carevn.luv2code.ez_tro.dto.response.PaymentListItemResponse;
import carevn.luv2code.ez_tro.dto.response.PaymentResponse;
import carevn.luv2code.ez_tro.dto.response.ReconciliationReportResponse;

/**
 * Service contract xử lý nhận tiền và phân bổ thanh toán vào hóa đơn.
 */
public interface PaymentAllocationService {
    PaymentResponse receivePayment(PaymentReceiveRequest request);

    PaymentResponse confirmPayment(Integer paymentId);

    PaymentResponse allocatePayment(Integer paymentId, PaymentAllocateRequest request);

    PaymentResponse reversePayment(Integer paymentId, PaymentReverseRequest request);

    PaymentResponse getPayment(Integer paymentId);

    Page<PaymentListItemResponse> filterPayments(
            String search,
            String status,
            String source,
            Integer contractId,
            LocalDate fromDate,
            LocalDate toDate,
            int page,
            int size);

    ReconciliationReportResponse getReconciliationReport(Integer contractId);

    DebtAgingReportResponse getDebtAgingReport(Integer contractId);

    CreditLedgerReportResponse getCreditLedgerReport(Integer contractId);

    void applyCarryForwardCredits(Integer billId);
}
