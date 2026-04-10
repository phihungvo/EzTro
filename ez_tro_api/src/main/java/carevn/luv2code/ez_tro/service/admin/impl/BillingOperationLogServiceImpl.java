package carevn.luv2code.ez_tro.service.admin.impl;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.Gson;

import carevn.luv2code.ez_tro.dto.response.BillingOperationLogResponse;
import carevn.luv2code.ez_tro.entity.Bill;
import carevn.luv2code.ez_tro.entity.BillingOperationLog;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.Payment;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.BillingAuditTargetType;
import carevn.luv2code.ez_tro.enums.BillingOperationType;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.repository.BillRepository;
import carevn.luv2code.ez_tro.repository.BillingOperationLogRepository;
import carevn.luv2code.ez_tro.repository.ContractRepository;
import carevn.luv2code.ez_tro.repository.PaymentAllocationRepository;
import carevn.luv2code.ez_tro.repository.PaymentRepository;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.BillingOperationLogService;
import carevn.luv2code.ez_tro.util.RequestAuditUtils;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BillingOperationLogServiceImpl implements BillingOperationLogService {

    private final BillingOperationLogRepository billingOperationLogRepository;
    private final ContractRepository contractRepository;
    private final BillRepository billRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentAllocationRepository paymentAllocationRepository;
    private final Gson gson = new Gson();

    /**
     * Tạo snapshot của bill để lưu vào log. Chỉ bao gồm các trường cơ bản và quan trọng, không bao gồm quan hệ phức tạp.
     *
     * @param bill đối tượng bill cần tạo snapshot
     * @return map chứa dữ liệu snapshot của bill
     */
    @Override
    public Map<String, Object> snapshotBill(Bill bill) {
        if (bill == null) {
            return null;
        }

        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("id", bill.getId());
        snapshot.put("billCode", bill.getBillCode());
        snapshot.put("billTitle", bill.getBillTitle());
        snapshot.put(
                "contractId", bill.getContract() != null ? bill.getContract().getId() : null);
        snapshot.put("tenantId", bill.getTenant() != null ? bill.getTenant().getId() : null);
        snapshot.put("roomId", bill.getRoom() != null ? bill.getRoom().getId() : null);
        snapshot.put("amount", bill.getAmount());
        snapshot.put(
                "dueDate", bill.getDueDate() == null ? null : bill.getDueDate().toString());
        snapshot.put("status", bill.getStatus());
        snapshot.put("paymentDate", bill.getPaymentDate());
        snapshot.put("invoiceType", bill.getInvoiceType());
        snapshot.put(
                "billingPeriodStart",
                bill.getBillingPeriodStart() == null
                        ? null
                        : bill.getBillingPeriodStart().toString());
        snapshot.put(
                "billingPeriodEnd",
                bill.getBillingPeriodEnd() == null
                        ? null
                        : bill.getBillingPeriodEnd().toString());
        snapshot.put("note", bill.getNote());
        snapshot.put("publicNote", bill.getPublicNote());
        snapshot.put("internalNote", bill.getInternalNote());
        snapshot.put("paymentInstructions", bill.getPaymentInstructions());
        snapshot.put("issuedAt", bill.getIssuedAt());
        snapshot.put("lifecycleStatus", bill.getLifecycleStatus());
        snapshot.put("sentAt", bill.getSentAt());
        snapshot.put("deliveryStatus", bill.getDeliveryStatus());
        snapshot.put("deliveryChannelsJson", bill.getDeliveryChannelsJson());
        snapshot.put("allocatedAmount", paymentAllocationRepository.sumAllocatedByBillId(bill.getId()));
        return snapshot;
    }

    /**
     * Tạo snapshot của payment để lưu vào log. Bao gồm các trường cơ bản và quan trọng, cũng như thông tin về số tiền đã được phân bổ và chưa phân bổ.
     *
     * @param payment đối tượng payment cần tạo snapshot
     * @return map chứa dữ liệu snapshot của payment
     */
    @Override
    public Map<String, Object> snapshotPayment(Payment payment) {
        if (payment == null) {
            return null;
        }

        BigDecimal allocatedAmount = paymentAllocationRepository.sumAllocatedByPaymentId(payment.getId());
        BigDecimal totalAmount = payment.getAmount() == null ? BigDecimal.ZERO : payment.getAmount();
        BigDecimal unallocatedAmount = allocatedAmount == null ? totalAmount : totalAmount.subtract(allocatedAmount);

        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("id", payment.getId());
        snapshot.put(
                "contractId",
                payment.getContract() != null ? payment.getContract().getId() : null);
        snapshot.put(
                "tenantId", payment.getTenant() != null ? payment.getTenant().getId() : null);
        snapshot.put("amount", payment.getAmount());
        snapshot.put("currency", payment.getCurrency());
        snapshot.put("externalReference", payment.getExternalReference());
        snapshot.put("source", payment.getSource());
        snapshot.put("status", payment.getStatus());
        snapshot.put("receivedAt", payment.getReceivedAt());
        snapshot.put("confirmedAt", payment.getConfirmedAt());
        snapshot.put("metadataJson", payment.getMetadataJson());
        snapshot.put("allocatedAmount", allocatedAmount);
        snapshot.put("unallocatedAmount", unallocatedAmount.max(BigDecimal.ZERO));
        return snapshot;
    }

    @Override
    @Transactional
    public void logBillOperation(
            BillingOperationType operationType,
            Contract contract,
            Integer billId,
            Object beforeState,
            Object afterState,
            Map<String, Object> metadata) {
        saveLog(BillingAuditTargetType.BILL, operationType, contract, billId, beforeState, afterState, metadata);
    }

    @Override
    @Transactional
    public void logPaymentOperation(
            BillingOperationType operationType,
            Contract contract,
            Integer paymentId,
            Object beforeState,
            Object afterState,
            Map<String, Object> metadata) {
        saveLog(BillingAuditTargetType.PAYMENT, operationType, contract, paymentId, beforeState, afterState, metadata);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BillingOperationLogResponse> getLogs(
            Integer contractId, BillingAuditTargetType targetType, Integer targetId) {
        if (contractId == null && (targetType == null || targetId == null)) {
            throw new AppException(ErrorCode.BILLING_AUDIT_FILTER_REQUIRED);
        }

        List<BillingOperationLog> logs;
        if (contractId != null && targetType != null && targetId != null) {
            logs = billingOperationLogRepository.findByContractIdAndTargetTypeAndTargetIdOrderByCreatedAtDesc(
                    contractId, targetType, targetId);
        } else if (contractId != null) {
            logs = billingOperationLogRepository.findByContractIdOrderByCreatedAtDesc(contractId);
        } else {
            logs = billingOperationLogRepository.findByTargetTypeAndTargetIdOrderByCreatedAtDesc(targetType, targetId);
        }

        validateAccess(resolveContractForValidation(contractId, targetType, targetId, logs));
        return logs.stream().map(this::toResponse).toList();
    }

    private void saveLog(
            BillingAuditTargetType targetType,
            BillingOperationType operationType,
            Contract contract,
            Integer targetId,
            Object beforeState,
            Object afterState,
            Map<String, Object> metadata) {
        if (contract == null || targetId == null) {
            return;
        }

        User currentUser = SecurityUtils.getCurrentUser();
        billingOperationLogRepository.save(BillingOperationLog.builder()
                .organization(contract.getOrganization())
                .contract(contract)
                .targetType(targetType)
                .targetId(targetId)
                .operationType(operationType)
                .requestId(RequestAuditUtils.getCurrentRequestId())
                .actor(currentUser)
                .beforeStateJson(toJson(beforeState))
                .afterStateJson(toJson(afterState))
                .metadataJson(buildMetadataJson(metadata, currentUser))
                .build());
    }

    private String buildMetadataJson(Map<String, Object> metadata, User currentUser) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("requestId", RequestAuditUtils.getCurrentRequestId());
        payload.put("actorId", currentUser == null ? null : currentUser.getId());
        payload.put("actorName", currentUser == null ? null : currentUser.getFullName());
        if (metadata != null && !metadata.isEmpty()) {
            payload.put("details", metadata);
        }
        return gson.toJson(payload);
    }

    /**
     * Xác định hợp đồng liên quan để kiểm tra quyền truy cập. Ưu tiên theo thứ tự: contractId > log đầu tiên > target (bill/payment).
     *
     * @param contractId id hợp đồng (nếu có)
     * @param targetType loại đối tượng (bill hoặc payment)
     * @param targetId   id của đối tượng
     * @param logs       danh sách log đã truy vấn (có thể rỗng)
     * @return hợp đồng liên quan hoặc null nếu không tìm thấy
     */
    private Contract resolveContractForValidation(
            Integer contractId, BillingAuditTargetType targetType, Integer targetId, List<BillingOperationLog> logs) {
        if (contractId != null) {
            return contractRepository
                    .findById(contractId)
                    .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        }
        if (!logs.isEmpty()) {
            return logs.getFirst().getContract();
        }
        if (targetType == BillingAuditTargetType.BILL) {
            return billRepository
                    .findById(targetId)
                    .map(Bill::getContract)
                    .orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));
        }
        return paymentRepository
                .findById(targetId)
                .map(Payment::getContract)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
    }

    private void validateAccess(Contract contract) {
        SecurityUtils.SpecificationSafeUser safe = SecurityUtils.safeUser();
        if (safe.isAdmin()) {
            return;
        }

        Integer ownerId = contract != null
                        && contract.getRoom() != null
                        && contract.getRoom().getBoardingHouse() != null
                        && contract.getRoom().getBoardingHouse().getOwner() != null
                ? contract.getRoom().getBoardingHouse().getOwner().getId()
                : null;
        if (ownerId == null || safe.getId() == null || !ownerId.equals(safe.getId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
    }

    private BillingOperationLogResponse toResponse(BillingOperationLog log) {
        return BillingOperationLogResponse.builder()
                .id(log.getId())
                .contractId(log.getContract() != null ? log.getContract().getId() : null)
                .targetType(log.getTargetType())
                .targetId(log.getTargetId())
                .operationType(log.getOperationType())
                .requestId(log.getRequestId())
                .actorId(log.getActor() != null ? log.getActor().getId() : null)
                .actorName(log.getActor() != null ? log.getActor().getFullName() : null)
                .beforeState(fromJson(log.getBeforeStateJson()))
                .afterState(fromJson(log.getAfterStateJson()))
                .metadata(fromJson(log.getMetadataJson()))
                .createdAt(log.getCreatedAt())
                .build();
    }

    private String toJson(Object payload) {
        return payload == null ? null : gson.toJson(payload);
    }

    private Object fromJson(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        return gson.fromJson(json, Object.class);
    }
}
