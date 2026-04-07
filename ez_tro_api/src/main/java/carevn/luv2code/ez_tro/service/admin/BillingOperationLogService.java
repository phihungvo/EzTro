package carevn.luv2code.ez_tro.service.admin;

import java.util.List;
import java.util.Map;

import carevn.luv2code.ez_tro.dto.response.BillingOperationLogResponse;
import carevn.luv2code.ez_tro.entity.Bill;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.Payment;
import carevn.luv2code.ez_tro.enums.BillingAuditTargetType;
import carevn.luv2code.ez_tro.enums.BillingOperationType;

public interface BillingOperationLogService {
    Map<String, Object> snapshotBill(Bill bill);

    Map<String, Object> snapshotPayment(Payment payment);

    void logBillOperation(
            BillingOperationType operationType,
            Contract contract,
            Integer billId,
            Object beforeState,
            Object afterState,
            Map<String, Object> metadata);

    void logPaymentOperation(
            BillingOperationType operationType,
            Contract contract,
            Integer paymentId,
            Object beforeState,
            Object afterState,
            Map<String, Object> metadata);

    List<BillingOperationLogResponse> getLogs(Integer contractId, BillingAuditTargetType targetType, Integer targetId);
}
