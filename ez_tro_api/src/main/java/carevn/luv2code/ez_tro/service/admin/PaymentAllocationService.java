package carevn.luv2code.ez_tro.service.admin;

import carevn.luv2code.ez_tro.dto.requests.PaymentAllocateRequest;
import carevn.luv2code.ez_tro.dto.requests.PaymentReceiveRequest;
import carevn.luv2code.ez_tro.dto.requests.PaymentReverseRequest;
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

    ReconciliationReportResponse getReconciliationReport(Integer contractId);
}
