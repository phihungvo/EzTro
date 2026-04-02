package carevn.luv2code.ez_tro.service.admin.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.function.Supplier;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.Gson;

import carevn.luv2code.ez_tro.dto.requests.BillPaymentSubmissionRequest;
import carevn.luv2code.ez_tro.dto.requests.PaymentAllocateRequest;
import carevn.luv2code.ez_tro.dto.requests.PaymentAllocationItemRequest;
import carevn.luv2code.ez_tro.dto.requests.PaymentConfirmRequest;
import carevn.luv2code.ez_tro.dto.requests.PaymentReceiveRequest;
import carevn.luv2code.ez_tro.dto.requests.PaymentReverseRequest;
import carevn.luv2code.ez_tro.dto.response.CreditLedgerEntryResponse;
import carevn.luv2code.ez_tro.dto.response.CreditLedgerReportResponse;
import carevn.luv2code.ez_tro.dto.response.DebtAgingBucketResponse;
import carevn.luv2code.ez_tro.dto.response.DebtAgingInvoiceResponse;
import carevn.luv2code.ez_tro.dto.response.DebtAgingReportResponse;
import carevn.luv2code.ez_tro.dto.response.InvoiceBalanceResponse;
import carevn.luv2code.ez_tro.dto.response.PaymentAllocationResponse;
import carevn.luv2code.ez_tro.dto.response.PaymentListItemResponse;
import carevn.luv2code.ez_tro.dto.response.PaymentResponse;
import carevn.luv2code.ez_tro.dto.response.ReconciliationReportResponse;
import carevn.luv2code.ez_tro.entity.*;
import carevn.luv2code.ez_tro.enums.BillStatus;
import carevn.luv2code.ez_tro.enums.BillingOperationType;
import carevn.luv2code.ez_tro.enums.CreditLedgerEntryType;
import carevn.luv2code.ez_tro.enums.PaymentAllocationType;
import carevn.luv2code.ez_tro.enums.PaymentOperationStatus;
import carevn.luv2code.ez_tro.enums.PaymentOperationType;
import carevn.luv2code.ez_tro.enums.PaymentSource;
import carevn.luv2code.ez_tro.enums.PaymentStatus;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.repository.BillRepository;
import carevn.luv2code.ez_tro.repository.ContractRepository;
import carevn.luv2code.ez_tro.repository.CreditLedgerEntryRepository;
import carevn.luv2code.ez_tro.repository.FileRepository;
import carevn.luv2code.ez_tro.repository.PaymentAllocationRepository;
import carevn.luv2code.ez_tro.repository.PaymentOperationLogRepository;
import carevn.luv2code.ez_tro.repository.PaymentRepository;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.BillingOperationLogService;
import carevn.luv2code.ez_tro.service.admin.ObservabilityMetricsService;
import carevn.luv2code.ez_tro.service.admin.PaymentAllocationService;
import carevn.luv2code.ez_tro.service.admin.payment.InvoiceBalanceCalculator;
import carevn.luv2code.ez_tro.specification.PaymentSpecs;
import carevn.luv2code.ez_tro.util.BillingIntegrityUtils;
import carevn.luv2code.ez_tro.util.RequestAuditUtils;
import lombok.RequiredArgsConstructor;

/**
 * Service xử lý nghiệp vụ nhận tiền và phân bổ thanh toán vào hóa đơn.
 *
 * <p>Khái niệm chính:
 * <ul>
 *   <li>{@link Payment}: khoản tiền nhận vào theo hợp đồng.</li>
 *   <li>{@link PaymentAllocation}: dòng phân bổ tiền vào từng {@link Bill} (ALLOCATE/REVERSAL).</li>
 * </ul>
 *
 * <p>Service hỗ trợ:
 * <ul>
 *   <li>Nhận payment theo externalReference (idempotent).</li>
 *   <li>Confirm payment, allocate manual/auto theo công nợ.</li>
 *   <li>Reverse payment (tạo allocations âm) và đồng bộ trạng thái bill (UNPAID/OVERDUE/PAID).</li>
 *   <li>Dựng báo cáo đối soát cho hợp đồng.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class PaymentAllocationServiceImpl implements PaymentAllocationService {

    private static final Set<PaymentStatus> CREDIT_ELIGIBLE_PAYMENT_STATUSES = EnumSet.of(
            PaymentStatus.CONFIRMED,
            PaymentStatus.PARTIALLY_ALLOCATED,
            PaymentStatus.FULLY_ALLOCATED,
            PaymentStatus.OVERPAID);

    private record AgingBucketAccumulator(String code, String label, BigDecimal amount, int count) {
        private AgingBucketAccumulator add(BigDecimal delta) {
            return new AgingBucketAccumulator(code, label, amount.add(delta), count + 1);
        }
    }

    private final PaymentRepository paymentRepository;
    private final PaymentAllocationRepository paymentAllocationRepository;
    private final ContractRepository contractRepository;
    private final BillRepository billRepository;
    private final FileRepository fileRepository;
    private final CreditLedgerEntryRepository creditLedgerEntryRepository;
    private final InvoiceBalanceCalculator invoiceBalanceCalculator;
    private final BillingDiscrepancyAlertService billingDiscrepancyAlertService;
    private final PaymentOperationLogRepository paymentOperationLogRepository;
    private final BillingOperationLogService billingOperationLogService;
    private final ObservabilityMetricsService observabilityMetricsService;
    private final Gson gson = new Gson();

    /**
     * Ghi nhận một khoản thanh toán vào hệ thống.
     *
     * <p>Idempotency: nếu {@code externalReference} đã tồn tại thì trả về payment hiện có.
     *
     * @param request payload nhận thanh toán
     * @return payment DTO
     */
    @Override
    @Transactional
    public PaymentResponse receivePayment(PaymentReceiveRequest request) {
        Contract contract = contractRepository
                .findById(request.getContractId())
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);

        return executeIdempotentPaymentOperation(
                contract,
                null,
                buildContractTargetKey(contract.getId()),
                PaymentOperationType.RECEIVE,
                false,
                () -> receivePaymentInternal(contract, request));
    }

    @Override
    @Transactional
    public PaymentResponse receiveTenantSubmittedPayment(Bill bill, BillPaymentSubmissionRequest request) {
        if (bill == null || bill.getContract() == null) {
            throw new AppException(ErrorCode.BILL_NOT_FOUND);
        }

        Contract contract = bill.getContract();
        File proofFile = resolvePaymentProofFile(bill, request != null ? request.getProofFileId() : null);
        String externalReference = request.getExternalReference() != null
                        && !request.getExternalReference().isBlank()
                ? request.getExternalReference().trim()
                : buildTenantExternalReference(bill);

        Payment existing =
                paymentRepository.findByExternalReference(externalReference).orElse(null);
        if (existing != null) {
            boolean sameContract = existing.getContract() != null
                    && existing.getContract().getId() != null
                    && existing.getContract().getId().equals(contract.getId());
            boolean sameTenant = existing.getTenant() != null
                    && bill.getTenant() != null
                    && existing.getTenant().getId() != null
                    && existing.getTenant().getId().equals(bill.getTenant().getId());
            if (sameContract && sameTenant) {
                return toPaymentResponse(existing);
            }
            throw new AppException(ErrorCode.PAYMENT_ALREADY_EXISTS);
        }

        User createdBy = SecurityUtils.getCurrentUserOrThrow();
        String currency =
                request.getCurrency() != null && !request.getCurrency().isBlank() ? request.getCurrency() : "VND";

        Payment payment = Payment.builder()
                .organization(contract.getOrganization())
                .contract(contract)
                .tenant(contract.getTenant())
                .amount(request.getAmount())
                .currency(currency)
                .externalReference(externalReference)
                .source(PaymentSource.TENANT_SUBMITTED)
                .status(PaymentStatus.PENDING)
                .note(normalizeTenantSubmittedNote(request))
                .metadataJson(gson.toJson(buildTenantPaymentMetadata(bill, request, proofFile)))
                .createdBy(createdBy)
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        billingOperationLogService.logPaymentOperation(
                BillingOperationType.PAYMENT_RECEIVE,
                contract,
                savedPayment.getId(),
                null,
                billingOperationLogService.snapshotPayment(savedPayment),
                buildTenantSubmissionAuditMetadata(bill, request, externalReference, proofFile));
        return toPaymentResponse(savedPayment);
    }

    private PaymentResponse receivePaymentInternal(Contract contract, PaymentReceiveRequest request) {
        Payment existing = paymentRepository
                .findByExternalReference(request.getExternalReference())
                .orElse(null);
        if (existing != null) {
            return toPaymentResponse(existing);
        }

        User createdBy = SecurityUtils.getCurrentUserOrThrow();
        String currency =
                request.getCurrency() != null && !request.getCurrency().isBlank() ? request.getCurrency() : "VND";

        Payment payment = Payment.builder()
                .organization(contract.getOrganization())
                .contract(contract)
                .tenant(contract.getTenant())
                .amount(request.getAmount())
                .currency(currency)
                .externalReference(request.getExternalReference())
                .source(PaymentSource.NORMAL)
                .status(PaymentStatus.PENDING)
                .receivedAt(request.getReceivedAt())
                .note(request.getNote())
                .metadataJson(null)
                .createdBy(createdBy)
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        billingOperationLogService.logPaymentOperation(
                BillingOperationType.PAYMENT_RECEIVE,
                contract,
                savedPayment.getId(),
                null,
                billingOperationLogService.snapshotPayment(savedPayment),
                buildReceiveAuditMetadata(request));
        return toPaymentResponse(savedPayment);
    }

    /**
     * Xác nhận một khoản thanh toán.
     *
     * @param paymentId id payment
     * @return payment DTO sau khi confirm
     */
    @Override
    @Transactional
    public PaymentResponse confirmPayment(Integer paymentId, PaymentConfirmRequest request) {
        Payment payment =
                paymentRepository.findById(paymentId).orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        validateContractAccess(payment.getContract());
        try {
            Map<String, Object> beforeState = billingOperationLogService.snapshotPayment(payment);

            if (payment.getStatus() == PaymentStatus.REVERSED || payment.getStatus() == PaymentStatus.FAILED) {
                throw new AppException(ErrorCode.PAYMENT_INVALID_STATE);
            }

            if (payment.getStatus() == PaymentStatus.PENDING) {
                payment.setStatus(PaymentStatus.CONFIRMED);
            }
            if (payment.getConfirmedAt() == null) {
                payment.setConfirmedAt(new Date());
            }

            Payment savedPayment = paymentRepository.save(payment);
            syncCreditLedgerForPayment(savedPayment, null, null);
            billingOperationLogService.logPaymentOperation(
                    BillingOperationType.PAYMENT_CONFIRM,
                    savedPayment.getContract(),
                    savedPayment.getId(),
                    beforeState,
                    billingOperationLogService.snapshotPayment(savedPayment),
                    buildConfirmAuditMetadata(savedPayment, request));
            return toPaymentResponse(savedPayment);
        } catch (RuntimeException ex) {
            observabilityMetricsService.incrementPaymentAllocationFailure(
                    payment.getContract(), "confirm", resolveFailureReason(ex));
            throw ex;
        }
    }

    /**
     * Phân bổ tiền của một payment vào các bill.
     *
     * <p>Nếu request có danh sách allocations thì phân bổ manual theo từng bill; nếu không có sẽ auto allocate
     * theo thứ tự dueDate.
     *
     * @param paymentId id payment
     * @param request payload allocations (có thể null)
     * @return payment DTO sau khi allocate
     */
    @Override
    @Transactional
    public PaymentResponse allocatePayment(Integer paymentId, PaymentAllocateRequest request) {
        BillingIntegrityUtils.validateManualAllocationRequest(request);

        Payment payment =
                paymentRepository.findById(paymentId).orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        validateContractAccess(payment.getContract());
        try {
            return executeIdempotentPaymentOperation(
                    payment.getContract(),
                    payment,
                    buildPaymentTargetKey(paymentId),
                    PaymentOperationType.ALLOCATE,
                    true,
                    () -> allocatePaymentInternal(paymentId, request));
        } catch (RuntimeException ex) {
            observabilityMetricsService.incrementPaymentAllocationFailure(
                    payment.getContract(), "allocate", resolveFailureReason(ex));
            throw ex;
        }
    }

    private PaymentResponse allocatePaymentInternal(Integer paymentId, PaymentAllocateRequest request) {
        // Khóa payment để tránh race condition khi có nhiều request allocate đồng thời.
        Payment payment = paymentRepository
                .findByIdForUpdate(paymentId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        Map<String, Object> beforeState = billingOperationLogService.snapshotPayment(payment);

        if (payment.getStatus() == PaymentStatus.REVERSED || payment.getStatus() == PaymentStatus.FAILED) {
            throw new AppException(ErrorCode.PAYMENT_INVALID_STATE);
        }

        if (payment.getStatus() == PaymentStatus.PENDING) {
            payment.setStatus(PaymentStatus.CONFIRMED);
            payment.setConfirmedAt(payment.getConfirmedAt() != null ? payment.getConfirmedAt() : new Date());
        }

        BigDecimal allocatedBefore = nullToZero(paymentAllocationRepository.sumAllocatedByPaymentId(payment.getId()));
        BigDecimal available = nullToZero(payment.getAmount()).subtract(allocatedBefore);
        if (available.signum() <= 0) {
            refreshPaymentStatus(payment);
            Payment savedPayment = paymentRepository.save(payment);
            billingOperationLogService.logPaymentOperation(
                    BillingOperationType.PAYMENT_ALLOCATE,
                    savedPayment.getContract(),
                    savedPayment.getId(),
                    beforeState,
                    billingOperationLogService.snapshotPayment(savedPayment),
                    buildAllocateAuditMetadata(request, List.of(), false));
            return toPaymentResponse(savedPayment);
        }

        List<PaymentAllocation> newAllocations = new ArrayList<>();
        Set<Integer> touchedBillIds = new HashSet<>();
        boolean autoAllocation = request == null
                || request.getAllocations() == null
                || request.getAllocations().isEmpty();

        if (request != null
                && request.getAllocations() != null
                && !request.getAllocations().isEmpty()) {
            List<Integer> billIds = request.getAllocations().stream()
                    .map(PaymentAllocationItemRequest::getBillId)
                    .filter(Objects::nonNull)
                    .toList();
            Map<Integer, Bill> lockedBills = billRepository.findByIdInForUpdate(billIds).stream()
                    .collect(HashMap::new, (map, bill) -> map.put(bill.getId(), bill), HashMap::putAll);
            available =
                    applyManualAllocations(payment, request, available, newAllocations, touchedBillIds, lockedBills);
        } else {
            // Auto allocate: khóa toàn bộ bill của hợp đồng để đảm bảo không bị double allocate.
            List<Bill> lockedBills = billRepository.findByContractIdForUpdate(
                    payment.getContract().getId());
            available = applyAutoAllocations(payment, available, newAllocations, touchedBillIds, lockedBills);
        }

        if (!newAllocations.isEmpty()) {
            paymentAllocationRepository.saveAll(newAllocations);
            syncBillsAfterAllocations(touchedBillIds);
            billingDiscrepancyAlertService.checkAndAlert(
                    payment.getContract(),
                    getReconciliationReport(payment.getContract().getId()));
        }

        refreshPaymentStatus(payment);
        Payment savedPayment = paymentRepository.save(payment);
        syncCreditLedgerForPayment(savedPayment, newAllocations, request != null ? request.getNote() : null);
        billingOperationLogService.logPaymentOperation(
                BillingOperationType.PAYMENT_ALLOCATE,
                savedPayment.getContract(),
                savedPayment.getId(),
                beforeState,
                billingOperationLogService.snapshotPayment(savedPayment),
                buildAllocateAuditMetadata(request, newAllocations, autoAllocation));
        return toPaymentResponse(savedPayment);
    }

    /**
     * Reverse một payment: tạo allocations âm cho từng bill đã được allocate.
     *
     * @param paymentId id payment
     * @param request payload reverse (note) - có thể null
     * @return payment DTO sau khi reverse
     */
    @Override
    @Transactional
    public PaymentResponse reversePayment(Integer paymentId, PaymentReverseRequest request) {
        Payment payment =
                paymentRepository.findById(paymentId).orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        validateContractAccess(payment.getContract());
        try {
            return executeIdempotentPaymentOperation(
                    payment.getContract(),
                    payment,
                    buildPaymentTargetKey(paymentId),
                    PaymentOperationType.REVERSE,
                    true,
                    () -> reversePaymentInternal(paymentId, request));
        } catch (RuntimeException ex) {
            observabilityMetricsService.incrementPaymentAllocationFailure(
                    payment.getContract(), "reverse", resolveFailureReason(ex));
            throw ex;
        }
    }

    private PaymentResponse reversePaymentInternal(Integer paymentId, PaymentReverseRequest request) {
        Payment payment = paymentRepository
                .findByIdForUpdate(paymentId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        Map<String, Object> beforeState = billingOperationLogService.snapshotPayment(payment);

        if (payment.getStatus() == PaymentStatus.REVERSED) {
            return toPaymentResponse(payment);
        }
        if (payment.getStatus() == PaymentStatus.FAILED) {
            throw new AppException(ErrorCode.PAYMENT_INVALID_STATE);
        }

        List<PaymentAllocation> allocations =
                paymentAllocationRepository.findByPaymentIdOrderByCreatedAtAsc(payment.getId());
        if (allocations.isEmpty()) {
            payment.setStatus(PaymentStatus.REVERSED);
            Payment savedPayment = paymentRepository.save(payment);
            billingOperationLogService.logPaymentOperation(
                    BillingOperationType.PAYMENT_REVERSE,
                    savedPayment.getContract(),
                    savedPayment.getId(),
                    beforeState,
                    billingOperationLogService.snapshotPayment(savedPayment),
                    buildReverseAuditMetadata(request, List.of()));
            return toPaymentResponse(savedPayment);
        }

        Map<Integer, BigDecimal> netByBillId = new LinkedHashMap<>();
        for (PaymentAllocation alloc : allocations) {
            Integer billId = alloc.getBill() != null ? alloc.getBill().getId() : null;
            if (billId == null) {
                continue;
            }
            netByBillId.merge(billId, nullToZero(alloc.getAmount()), BigDecimal::add);
        }

        User createdBy = SecurityUtils.getCurrentUserOrThrow();
        List<PaymentAllocation> reversalAllocations = new ArrayList<>();
        Set<Integer> touchedBillIds = new HashSet<>();
        for (Map.Entry<Integer, BigDecimal> entry : netByBillId.entrySet()) {
            if (entry.getValue().signum() == 0) {
                continue;
            }

            Bill bill = billRepository.findById(entry.getKey()).orElse(null);
            if (bill == null) {
                continue;
            }

            PaymentAllocation reversal = PaymentAllocation.builder()
                    .payment(payment)
                    .bill(bill)
                    .amount(entry.getValue().negate())
                    .allocationType(PaymentAllocationType.REVERSAL)
                    .note(request != null ? request.getNote() : null)
                    .createdBy(createdBy)
                    .build();
            reversalAllocations.add(reversal);
            touchedBillIds.add(bill.getId());
        }

        if (!reversalAllocations.isEmpty()) {
            paymentAllocationRepository.saveAll(reversalAllocations);
            syncBillsAfterAllocations(touchedBillIds);
        }

        payment.setStatus(PaymentStatus.REVERSED);
        Payment savedPayment = paymentRepository.save(payment);
        syncCreditLedgerForPayment(savedPayment, reversalAllocations, request != null ? request.getNote() : null);
        billingOperationLogService.logPaymentOperation(
                BillingOperationType.PAYMENT_REVERSE,
                savedPayment.getContract(),
                savedPayment.getId(),
                beforeState,
                billingOperationLogService.snapshotPayment(savedPayment),
                buildReverseAuditMetadata(request, reversalAllocations));
        return toPaymentResponse(savedPayment);
    }

    /**
     * Lấy chi tiết payment theo id.
     *
     * @param paymentId id payment
     * @return payment DTO
     */
    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPayment(Integer paymentId) {
        Payment payment =
                paymentRepository.findById(paymentId).orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        validateContractAccess(payment.getContract());
        return toPaymentResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentListItemResponse> filterPayments(
            String search,
            String status,
            String source,
            Integer contractId,
            LocalDate fromDate,
            LocalDate toDate,
            int page,
            int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "receivedAt", "id"));
        SecurityUtils.SpecificationSafeUser safe = SecurityUtils.safeUser();

        Specification<Payment> spec = Specification.where(null);
        if (!safe.isAdmin()) {
            spec = spec.and(PaymentSpecs.ownedByOwner(safe.get()));
        }

        if (search != null && !search.trim().isEmpty()) {
            spec = spec.and(searchPayments(search));
        }

        spec = spec.and(PaymentSpecs.hasStatus(parsePaymentStatus(status)));
        spec = spec.and(PaymentSpecs.hasSource(parsePaymentSource(source)));
        spec = spec.and(PaymentSpecs.hasContractId(contractId));
        spec = spec.and(PaymentSpecs.receivedFrom(fromDate));
        spec = spec.and(PaymentSpecs.receivedTo(toDate));

        return paymentRepository.findAll(spec, pageable).map(this::toPaymentListItemResponse);
    }

    /**
     * Dựng báo cáo đối soát (reconciliation) cho một hợp đồng.
     *
     * @param contractId id hợp đồng
     * @return báo cáo đối soát
     */
    @Override
    @Transactional(readOnly = true)
    public ReconciliationReportResponse getReconciliationReport(Integer contractId) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);
        return buildReconciliationReport(contract);
    }

    private ReconciliationReportResponse buildReconciliationReport(Contract contract) {
        Integer contractId = contract.getId();
        List<Bill> bills = billRepository.findByContractId(contractId).stream()
                .filter(bill -> bill.getStatus() != BillStatus.CANCELLED)
                .toList();
        List<InvoiceBalanceResponse> invoiceBalances =
                bills.stream().map(invoiceBalanceCalculator::calculate).toList();

        BigDecimal invoiceTotal = invoiceBalances.stream()
                .map(InvoiceBalanceResponse::getInvoiceTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal allocationTotal = invoiceBalances.stream()
                .map(InvoiceBalanceResponse::getAllocatedAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal outstandingTotal = invoiceBalances.stream()
                .map(InvoiceBalanceResponse::getOutstandingAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Payment> payments = paymentRepository.findByContractIdOrderByReceivedAtAsc(contractId);
        BigDecimal paymentTotal = payments.stream()
                // Chỉ tính các khoản đã xác nhận/đã phân bổ; loại PENDING/FAILED/REVERSED để tránh sai số đối soát.
                .filter(this::isCountableForReconciliation)
                .map(Payment::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal creditTotal = paymentTotal.subtract(allocationTotal);
        if (creditTotal.signum() < 0) {
            creditTotal = BigDecimal.ZERO;
        }
        BigDecimal ratio = BigDecimal.ZERO;
        if (invoiceTotal.signum() > 0) {
            ratio = outstandingTotal
                    .divide(invoiceTotal, 4, RoundingMode.HALF_UP)
                    .max(BigDecimal.ZERO);
        }
        boolean hasDiscrepancy = ratio.compareTo(billingDiscrepancyAlertService.thresholdOrZero()) > 0;

        return ReconciliationReportResponse.builder()
                .contractId(contractId)
                .invoiceTotal(invoiceTotal)
                .paymentTotal(paymentTotal)
                .allocationTotal(allocationTotal)
                .outstandingTotal(outstandingTotal)
                .creditTotal(creditTotal)
                .invoices(invoiceBalances)
                .discrepancyPercent(ratio)
                .discrepancyAlert(hasDiscrepancy)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public DebtAgingReportResponse getDebtAgingReport(Integer contractId) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);

        LocalDate reportDate = LocalDate.now();
        Map<String, AgingBucketAccumulator> buckets = new LinkedHashMap<>();
        buckets.put("0_30", new AgingBucketAccumulator("0_30", "0-30 ngày", BigDecimal.ZERO, 0));
        buckets.put("31_60", new AgingBucketAccumulator("31_60", "31-60 ngày", BigDecimal.ZERO, 0));
        buckets.put("61_90", new AgingBucketAccumulator("61_90", "61-90 ngày", BigDecimal.ZERO, 0));
        buckets.put("GT_90", new AgingBucketAccumulator("GT_90", ">90 ngày", BigDecimal.ZERO, 0));

        List<DebtAgingInvoiceResponse> invoices = new ArrayList<>();
        BigDecimal totalOutstanding = BigDecimal.ZERO;

        for (Bill bill : billRepository.findByContractId(contractId)) {
            if (bill.getStatus() == BillStatus.CANCELLED) {
                continue;
            }

            InvoiceBalanceResponse balance = invoiceBalanceCalculator.calculate(bill);
            BigDecimal outstanding = nullToZero(balance.getOutstandingAmount());
            if (outstanding.signum() <= 0) {
                continue;
            }

            int ageDays = resolveAgeDays(bill.getDueDate(), reportDate);
            String bucketCode = resolveBucketCode(ageDays);
            AgingBucketAccumulator bucket = buckets.get(bucketCode);
            buckets.put(bucketCode, bucket.add(outstanding));

            invoices.add(DebtAgingInvoiceResponse.builder()
                    .billId(bill.getId())
                    .billCode(bill.getBillCode())
                    .billTitle(bill.getBillTitle())
                    .dueDate(bill.getDueDate())
                    .ageDays(ageDays)
                    .bucketCode(bucketCode)
                    .outstandingAmount(outstanding)
                    .build());
            totalOutstanding = totalOutstanding.add(outstanding);
        }

        List<DebtAgingBucketResponse> bucketResponses = buckets.values().stream()
                .map(bucket -> DebtAgingBucketResponse.builder()
                        .bucketCode(bucket.code())
                        .label(bucket.label())
                        .invoiceCount(bucket.count())
                        .outstandingAmount(bucket.amount())
                        .build())
                .toList();

        return DebtAgingReportResponse.builder()
                .contractId(contractId)
                .reportDate(reportDate)
                .totalOutstanding(totalOutstanding)
                .buckets(bucketResponses)
                .invoices(invoices)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public CreditLedgerReportResponse getCreditLedgerReport(Integer contractId) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);

        List<CreditLedgerEntryResponse> entries =
                creditLedgerEntryRepository.findByContractIdOrderByCreatedAtAscIdAsc(contractId).stream()
                        .map(this::toCreditLedgerEntryResponse)
                        .toList();

        return CreditLedgerReportResponse.builder()
                .contractId(contractId)
                .currentBalance(nullToZero(creditLedgerEntryRepository.sumAmountByContractId(contractId)))
                .entries(entries)
                .build();
    }

    @Override
    @Transactional
    public void applyCarryForwardCredits(Integer billId) {
        Bill bill = billRepository.findByIdInForUpdate(List.of(billId)).stream()
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));
        if (bill.getStatus() == BillStatus.CANCELLED) {
            return;
        }

        BigDecimal outstanding =
                nullToZero(invoiceBalanceCalculator.calculate(bill).getOutstandingAmount());
        if (outstanding.signum() <= 0) {
            return;
        }

        List<Payment> payments = paymentRepository.findByContractIdAndStatusInForUpdate(
                bill.getContract().getId(), CREDIT_ELIGIBLE_PAYMENT_STATUSES);
        List<PaymentAllocation> allocations = new ArrayList<>();
        Map<Integer, Map<String, Object>> beforeStatesByPaymentId = new HashMap<>();
        Map<Integer, List<PaymentAllocation>> allocationsByPaymentId = new HashMap<>();

        for (Payment payment : payments) {
            BigDecimal available = resolveAvailableCreditAmount(payment);
            if (available.signum() <= 0) {
                continue;
            }

            BigDecimal allocAmount = outstanding.min(available);
            if (allocAmount.signum() <= 0) {
                continue;
            }

            beforeStatesByPaymentId.put(payment.getId(), billingOperationLogService.snapshotPayment(payment));
            PaymentAllocation allocation = PaymentAllocation.builder()
                    .payment(payment)
                    .bill(bill)
                    .amount(allocAmount)
                    .allocationType(PaymentAllocationType.ALLOCATE)
                    .note("Auto carry-forward credit")
                    .createdBy(SecurityUtils.getCurrentUser())
                    .build();
            allocations.add(allocation);
            allocationsByPaymentId
                    .computeIfAbsent(payment.getId(), ignored -> new ArrayList<>())
                    .add(allocation);
            outstanding = outstanding.subtract(allocAmount);
            if (outstanding.signum() <= 0) {
                break;
            }
        }

        if (allocations.isEmpty()) {
            return;
        }

        paymentAllocationRepository.saveAll(allocations);
        syncBillsAfterAllocations(Set.of(bill.getId()));

        for (Payment payment : payments) {
            List<PaymentAllocation> paymentAllocations = allocationsByPaymentId.get(payment.getId());
            if (paymentAllocations == null || paymentAllocations.isEmpty()) {
                continue;
            }
            refreshPaymentStatus(payment);
            Payment savedPayment = paymentRepository.save(payment);
            syncCreditLedgerForPayment(savedPayment, paymentAllocations, "Auto carry-forward credit");
            billingOperationLogService.logPaymentOperation(
                    BillingOperationType.PAYMENT_ALLOCATE,
                    savedPayment.getContract(),
                    savedPayment.getId(),
                    beforeStatesByPaymentId.get(savedPayment.getId()),
                    billingOperationLogService.snapshotPayment(savedPayment),
                    buildAllocateAuditMetadata(null, paymentAllocations, true));
        }

        billingDiscrepancyAlertService.checkAndAlert(bill.getContract(), buildReconciliationReport(bill.getContract()));
    }

    @Override
    @Transactional
    public void syncPaymentDerivedState(Integer paymentId, String note) {
        Payment payment = paymentRepository
                .findByIdForUpdate(paymentId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        validateContractAccess(payment.getContract());

        refreshPaymentStatus(payment);
        Payment savedPayment = paymentRepository.save(payment);
        syncCreditLedgerForPayment(savedPayment, null, note);
        billingDiscrepancyAlertService.checkAndAlert(
                savedPayment.getContract(),
                getReconciliationReport(savedPayment.getContract().getId()));
    }

    private PaymentResponse executeIdempotentPaymentOperation(
            Contract contract,
            Payment payment,
            String targetKey,
            PaymentOperationType operationType,
            boolean requireIdempotencyKey,
            Supplier<PaymentResponse> action) {
        IdempotentPaymentOperationGuard guard =
                beginIdempotentPaymentOperation(contract, payment, targetKey, operationType, requireIdempotencyKey);
        if (guard.replayExistingResult()) {
            return replayPaymentResponse(guard.operationLog(), payment);
        }

        PaymentResponse response = action.get();
        completePaymentOperationLog(guard.operationLog(), resolvePaymentForLog(payment, response), response);
        return response;
    }

    private IdempotentPaymentOperationGuard beginIdempotentPaymentOperation(
            Contract contract,
            Payment payment,
            String targetKey,
            PaymentOperationType operationType,
            boolean requireIdempotencyKey) {
        String idempotencyKey = RequestAuditUtils.getCurrentIdempotencyKey();
        if (idempotencyKey == null) {
            if (requireIdempotencyKey && RequestAuditUtils.hasCurrentHttpRequest()) {
                throw new AppException(ErrorCode.PAYMENT_IDEMPOTENCY_KEY_REQUIRED);
            }
            return IdempotentPaymentOperationGuard.noop();
        }

        PaymentOperationLog existingOperationLog = paymentOperationLogRepository
                .findByTargetKeyAndOperationTypeAndIdempotencyKey(targetKey, operationType, idempotencyKey)
                .orElse(null);
        if (existingOperationLog != null) {
            return buildGuardFromExistingPaymentLog(existingOperationLog);
        }

        User currentUser = SecurityUtils.getCurrentUser();
        PaymentOperationLog operationLog = PaymentOperationLog.builder()
                .organization(contract.getOrganization())
                .contract(contract)
                .payment(payment)
                .targetKey(targetKey)
                .operationType(operationType)
                .idempotencyKey(idempotencyKey)
                .status(PaymentOperationStatus.PROCESSING)
                .requestId(RequestAuditUtils.getCurrentRequestId())
                .actor(currentUser)
                .metadataJson(buildPaymentOperationLogMetadataJson(
                        targetKey, operationType, PaymentOperationStatus.PROCESSING, currentUser))
                .build();
        try {
            return new IdempotentPaymentOperationGuard(paymentOperationLogRepository.saveAndFlush(operationLog), false);
        } catch (DataIntegrityViolationException ex) {
            PaymentOperationLog persistedOperationLog = paymentOperationLogRepository
                    .findByTargetKeyAndOperationTypeAndIdempotencyKey(targetKey, operationType, idempotencyKey)
                    .orElse(null);
            if (persistedOperationLog != null) {
                return buildGuardFromExistingPaymentLog(persistedOperationLog);
            }
            throw ex;
        }
    }

    private IdempotentPaymentOperationGuard buildGuardFromExistingPaymentLog(PaymentOperationLog operationLog) {
        if (operationLog.getStatus() == PaymentOperationStatus.COMPLETED) {
            return new IdempotentPaymentOperationGuard(operationLog, true);
        }
        throw new AppException(ErrorCode.PAYMENT_OPERATION_ALREADY_PROCESSING);
    }

    private void completePaymentOperationLog(
            PaymentOperationLog operationLog, Payment payment, PaymentResponse response) {
        if (operationLog == null) {
            return;
        }

        User currentUser = SecurityUtils.getCurrentUser();
        operationLog.setPayment(payment);
        operationLog.setStatus(PaymentOperationStatus.COMPLETED);
        operationLog.setCompletedAt(new Date());
        operationLog.setActor(currentUser);
        operationLog.setRequestId(RequestAuditUtils.getCurrentRequestId());
        operationLog.setResultJson(response == null ? null : gson.toJson(response));
        operationLog.setMetadataJson(buildPaymentOperationLogMetadataJson(
                operationLog.getTargetKey(),
                operationLog.getOperationType(),
                PaymentOperationStatus.COMPLETED,
                currentUser));
        paymentOperationLogRepository.save(operationLog);
    }

    private String buildPaymentOperationLogMetadataJson(
            String targetKey, PaymentOperationType operationType, PaymentOperationStatus status, User currentUser) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("targetKey", targetKey);
        metadata.put("operationType", operationType.name());
        metadata.put("status", status.name());
        metadata.put("requestId", RequestAuditUtils.getCurrentRequestId());
        metadata.put("actorId", currentUser == null ? null : currentUser.getId());
        metadata.put("actorName", currentUser == null ? null : currentUser.getFullName());
        return gson.toJson(metadata);
    }

    private Payment resolvePaymentForLog(Payment fallbackPayment, PaymentResponse response) {
        Integer paymentId = response != null && response.getId() != null
                ? response.getId()
                : fallbackPayment != null ? fallbackPayment.getId() : null;
        if (paymentId == null) {
            return fallbackPayment;
        }
        return paymentRepository.findById(paymentId).orElse(fallbackPayment);
    }

    private PaymentResponse replayPaymentResponse(PaymentOperationLog operationLog, Payment fallbackPayment) {
        if (operationLog != null
                && operationLog.getResultJson() != null
                && !operationLog.getResultJson().isBlank()) {
            try {
                return gson.fromJson(operationLog.getResultJson(), PaymentResponse.class);
            } catch (RuntimeException ignored) {
                // Fallback sang trạng thái hiện tại của payment nếu payload cũ không parse được.
            }
        }

        Payment resolvedPayment = operationLog != null && operationLog.getPayment() != null
                ? resolvePaymentForLog(operationLog.getPayment(), null)
                : resolvePaymentForLog(fallbackPayment, null);
        if (resolvedPayment != null) {
            return toPaymentResponse(resolvedPayment);
        }
        throw new AppException(ErrorCode.PAYMENT_NOT_FOUND);
    }

    private String buildContractTargetKey(Integer contractId) {
        return "CONTRACT:" + contractId;
    }

    private String buildPaymentTargetKey(Integer paymentId) {
        return "PAYMENT:" + paymentId;
    }

    private Map<String, Object> buildReceiveAuditMetadata(PaymentReceiveRequest request) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("externalReference", request.getExternalReference());
        metadata.put("amount", request.getAmount());
        metadata.put("receivedAt", request.getReceivedAt());
        metadata.put("currency", request.getCurrency());
        metadata.put("note", request.getNote());
        return metadata;
    }

    private Map<String, Object> buildTenantSubmissionAuditMetadata(
            Bill bill, BillPaymentSubmissionRequest request, String externalReference, File proofFile) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("origin", "TENANT_PORTAL");
        metadata.put("billId", bill != null ? bill.getId() : null);
        metadata.put("billCode", bill != null ? bill.getBillCode() : null);
        metadata.put("externalReference", externalReference);
        metadata.put("amount", request != null ? request.getAmount() : null);
        metadata.put("currency", request != null ? request.getCurrency() : null);
        metadata.put("paymentMethod", request != null ? request.getPaymentMethod() : null);
        metadata.put("proofFileId", proofFile != null ? proofFile.getId() : null);
        metadata.put("proofFileName", proofFile != null ? proofFile.getOriginalName() : null);
        metadata.put("note", request != null ? request.getNote() : null);
        return metadata;
    }

    private Map<String, Object> buildTenantPaymentMetadata(
            Bill bill, BillPaymentSubmissionRequest request, File proofFile) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("origin", "TENANT_PORTAL");
        metadata.put("billId", bill != null ? bill.getId() : null);
        metadata.put("billCode", bill != null ? bill.getBillCode() : null);
        metadata.put("paymentMethod", request != null ? request.getPaymentMethod() : null);
        metadata.put("proofFileId", proofFile != null ? proofFile.getId() : null);
        metadata.put("proofFileName", proofFile != null ? proofFile.getOriginalName() : null);
        metadata.put("submittedByTenant", true);
        return metadata;
    }

    private String normalizeTenantSubmittedNote(BillPaymentSubmissionRequest request) {
        if (request == null) {
            return null;
        }
        String method =
                request.getPaymentMethod() != null ? request.getPaymentMethod().trim() : null;
        String note = request.getNote() != null ? request.getNote().trim() : null;
        if ((note == null || note.isBlank()) && (method == null || method.isBlank())) {
            return "Tenant gửi xác nhận thanh toán từ portal";
        }
        if (note == null || note.isBlank()) {
            return "Tenant gửi xác nhận thanh toán qua " + method;
        }
        if (method == null || method.isBlank()) {
            return note;
        }
        return "Phương thức: " + method + ". " + note;
    }

    private String buildTenantExternalReference(Bill bill) {
        return "TENANT-" + (bill != null ? bill.getId() : "BILL") + "-" + System.currentTimeMillis();
    }

    private Map<String, Object> buildAllocateAuditMetadata(
            PaymentAllocateRequest request, List<PaymentAllocation> allocations, boolean autoAllocation) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("autoAllocation", autoAllocation);
        metadata.put("createdAllocationCount", allocations == null ? 0 : allocations.size());
        metadata.put(
                "billIds",
                allocations == null
                        ? List.of()
                        : allocations.stream()
                                .map(PaymentAllocation::getBill)
                                .filter(Objects::nonNull)
                                .map(Bill::getId)
                                .toList());
        if (request != null) {
            metadata.put("note", request.getNote());
            metadata.put(
                    "requestedAllocationCount",
                    request.getAllocations() == null
                            ? 0
                            : request.getAllocations().size());
        }
        return metadata;
    }

    private Map<String, Object> buildReverseAuditMetadata(
            PaymentReverseRequest request, List<PaymentAllocation> reversalAllocations) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("reversalCount", reversalAllocations == null ? 0 : reversalAllocations.size());
        metadata.put(
                "billIds",
                reversalAllocations == null
                        ? List.of()
                        : reversalAllocations.stream()
                                .map(PaymentAllocation::getBill)
                                .filter(Objects::nonNull)
                                .map(Bill::getId)
                                .toList());
        metadata.put("note", request != null ? request.getNote() : null);
        return metadata;
    }

    private void syncCreditLedgerForPayment(Payment payment, List<PaymentAllocation> allocations, String note) {
        if (payment == null || payment.getId() == null) {
            return;
        }

        BigDecimal currentBalance = nullToZero(creditLedgerEntryRepository.sumAmountByPaymentId(payment.getId()));
        BigDecimal targetBalance = resolveAvailableCreditAmount(payment);
        BigDecimal delta = targetBalance.subtract(currentBalance);
        if (delta.signum() == 0) {
            return;
        }

        CreditLedgerEntryType entryType = resolveCreditLedgerEntryType(payment, delta);
        CreditLedgerEntry entry = CreditLedgerEntry.builder()
                .organization(payment.getOrganization())
                .contract(payment.getContract())
                .payment(payment)
                .bill(resolveLedgerBill(allocations))
                .entryType(entryType)
                .amount(delta)
                .note(note)
                .metadataJson(buildCreditLedgerMetadataJson(payment, currentBalance, targetBalance, allocations))
                .createdBy(SecurityUtils.getCurrentUser())
                .build();
        creditLedgerEntryRepository.save(entry);
    }

    private CreditLedgerEntryType resolveCreditLedgerEntryType(Payment payment, BigDecimal delta) {
        if (delta.signum() > 0) {
            return CreditLedgerEntryType.CREDIT_ISSUED;
        }
        if (payment.getStatus() == PaymentStatus.REVERSED || payment.getStatus() == PaymentStatus.FAILED) {
            return CreditLedgerEntryType.CREDIT_REVERSED;
        }
        return CreditLedgerEntryType.CREDIT_APPLIED;
    }

    private Bill resolveLedgerBill(List<PaymentAllocation> allocations) {
        if (allocations == null || allocations.isEmpty()) {
            return null;
        }
        Bill firstBill = allocations.getFirst().getBill();
        boolean sameBill =
                allocations.stream().map(PaymentAllocation::getBill).allMatch(bill -> Objects.equals(bill, firstBill));
        return sameBill ? firstBill : null;
    }

    private String buildCreditLedgerMetadataJson(
            Payment payment, BigDecimal currentBalance, BigDecimal targetBalance, List<PaymentAllocation> allocations) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put(
                "paymentStatus",
                payment.getStatus() != null ? payment.getStatus().name() : null);
        metadata.put("currentBalance", currentBalance);
        metadata.put("targetBalance", targetBalance);
        metadata.put(
                "billIds",
                allocations == null
                        ? List.of()
                        : allocations.stream()
                                .map(PaymentAllocation::getBill)
                                .filter(Objects::nonNull)
                                .map(Bill::getId)
                                .distinct()
                                .toList());
        metadata.put("allocationCount", allocations == null ? 0 : allocations.size());
        return gson.toJson(metadata);
    }

    private BigDecimal resolveAvailableCreditAmount(Payment payment) {
        if (payment == null || payment.getId() == null || !isCountableForReconciliation(payment)) {
            return BigDecimal.ZERO;
        }
        BigDecimal allocated = nullToZero(paymentAllocationRepository.sumAllocatedByPaymentId(payment.getId()));
        BigDecimal available = nullToZero(payment.getAmount()).subtract(allocated);
        return available.signum() > 0 ? available : BigDecimal.ZERO;
    }

    private BigDecimal applyManualAllocations(
            Payment payment,
            PaymentAllocateRequest request,
            BigDecimal available,
            List<PaymentAllocation> newAllocations,
            Set<Integer> touchedBillIds,
            Map<Integer, Bill> lockedBills) {

        User createdBy = SecurityUtils.getCurrentUserOrThrow();
        Map<Integer, BigDecimal> localAllocated = new HashMap<>();

        for (PaymentAllocationItemRequest item : request.getAllocations()) {
            Bill bill = lockedBills != null ? lockedBills.get(item.getBillId()) : null;
            if (bill == null) {
                throw new AppException(ErrorCode.BILL_NOT_FOUND);
            }
            if (bill.getContract() == null
                    || !bill.getContract().getId().equals(payment.getContract().getId())) {
                throw new AppException(ErrorCode.PAYMENT_ALLOCATION_INVALID);
            }
            if (bill.getStatus() == BillStatus.CANCELLED) {
                throw new AppException(ErrorCode.PAYMENT_ALLOCATION_INVALID);
            }

            BigDecimal alreadyAllocated = nullToZero(paymentAllocationRepository.sumAllocatedByBillId(bill.getId()));
            BigDecimal alreadyAllocatedInBatch = nullToZero(localAllocated.get(bill.getId()));
            BigDecimal outstanding =
                    nullToZero(bill.getAmount()).subtract(alreadyAllocated).subtract(alreadyAllocatedInBatch);

            if (item.getAmount().compareTo(outstanding) > 0) {
                throw new AppException(ErrorCode.PAYMENT_ALLOCATION_INVALID);
            }
            if (item.getAmount().compareTo(available) > 0) {
                throw new AppException(ErrorCode.PAYMENT_ALLOCATION_INVALID);
            }

            PaymentAllocation allocation = PaymentAllocation.builder()
                    .payment(payment)
                    .bill(bill)
                    .amount(item.getAmount())
                    .allocationType(PaymentAllocationType.ALLOCATE)
                    .note(request.getNote())
                    .createdBy(createdBy)
                    .build();

            newAllocations.add(allocation);
            touchedBillIds.add(bill.getId());
            localAllocated.merge(bill.getId(), item.getAmount(), BigDecimal::add);
            available = available.subtract(item.getAmount());

            if (available.signum() <= 0) {
                break;
            }
        }

        return available;
    }

    private BigDecimal applyAutoAllocations(
            Payment payment,
            BigDecimal available,
            List<PaymentAllocation> newAllocations,
            Set<Integer> touchedBillIds,
            List<Bill> lockedBills) {

        User createdBy = SecurityUtils.getCurrentUserOrThrow();
        Map<String, Object> paymentMetadata = parsePaymentMetadata(payment.getMetadataJson());
        Integer preferredBillId = metadataInteger(paymentMetadata, "billId");

        List<Bill> bills = (lockedBills != null ? lockedBills : List.<Bill>of())
                .stream()
                        .filter(bill -> bill.getAmount() != null
                                && bill.getAmount().signum() > 0
                                && bill.getStatus() != BillStatus.CANCELLED)
                        .sorted(Comparator.comparing(
                                        (Bill bill) -> Objects.equals(bill.getId(), preferredBillId) ? 0 : 1)
                                .thenComparing(Bill::getDueDate, Comparator.nullsLast(Comparator.naturalOrder()))
                                .thenComparing(Bill::getId))
                        .toList();

        Map<Integer, BigDecimal> localAllocated = new HashMap<>();

        for (Bill bill : bills) {
            BigDecimal alreadyAllocated = nullToZero(paymentAllocationRepository.sumAllocatedByBillId(bill.getId()));
            BigDecimal alreadyAllocatedInBatch = nullToZero(localAllocated.get(bill.getId()));
            BigDecimal outstanding =
                    nullToZero(bill.getAmount()).subtract(alreadyAllocated).subtract(alreadyAllocatedInBatch);
            if (outstanding.signum() <= 0) {
                continue;
            }

            BigDecimal allocAmount = available.min(outstanding);
            if (allocAmount.signum() <= 0) {
                continue;
            }

            PaymentAllocation allocation = PaymentAllocation.builder()
                    .payment(payment)
                    .bill(bill)
                    .amount(allocAmount)
                    .allocationType(PaymentAllocationType.ALLOCATE)
                    .note(null)
                    .createdBy(createdBy)
                    .build();

            newAllocations.add(allocation);
            touchedBillIds.add(bill.getId());
            localAllocated.merge(bill.getId(), allocAmount, BigDecimal::add);
            available = available.subtract(allocAmount);
            if (available.signum() <= 0) {
                break;
            }
        }

        return available;
    }

    private void syncBillsAfterAllocations(Set<Integer> billIds) {
        if (billIds == null || billIds.isEmpty()) {
            return;
        }

        LocalDate today = LocalDate.now();
        for (Integer billId : billIds) {
            Bill bill = billRepository.findById(billId).orElse(null);
            if (bill == null) {
                continue;
            }

            InvoiceBalanceResponse balance = invoiceBalanceCalculator.calculate(bill);
            applyBillStatusFromBalance(bill, balance, today);
            billRepository.save(bill);
        }
    }

    private void applyBillStatusFromBalance(Bill bill, InvoiceBalanceResponse balance, LocalDate today) {
        if (bill.getStatus() == BillStatus.CANCELLED) {
            // Không tự động đổi trạng thái hóa đơn đã hủy.
            return;
        }
        BigDecimal outstanding = balance.getOutstandingAmount();
        if (outstanding != null && outstanding.signum() <= 0) {
            bill.setStatus(BillStatus.PAID);
            bill.setPaymentDate(new Date());
            return;
        }

        bill.setPaymentDate(null);
        if (bill.getDueDate() != null && bill.getDueDate().isBefore(today)) {
            // Quá hạn thì ưu tiên OVERDUE, kể cả có trả một phần.
            bill.setStatus(BillStatus.OVERDUE);
        } else {
            // Nếu đã phân bổ một phần thì chuyển PARTIALLY_PAID để phản ánh đúng trạng thái thực tế.
            if (outstanding != null
                    && outstanding.signum() > 0
                    && balance.getAllocatedAmount() != null
                    && balance.getAllocatedAmount().signum() > 0) {
                bill.setStatus(BillStatus.PARTIALLY_PAID);
            } else {
                bill.setStatus(BillStatus.UNPAID);
            }
        }
    }

    private void refreshPaymentStatus(Payment payment) {
        BigDecimal allocated = nullToZero(paymentAllocationRepository.sumAllocatedByPaymentId(payment.getId()));
        BigDecimal total = nullToZero(payment.getAmount());

        if (payment.getStatus() == PaymentStatus.REVERSED || payment.getStatus() == PaymentStatus.FAILED) {
            return;
        }

        if (allocated.signum() <= 0) {
            if (payment.getStatus() == PaymentStatus.PENDING) {
                return;
            }
            payment.setStatus(PaymentStatus.CONFIRMED);
            return;
        }

        int cmp = allocated.compareTo(total);
        if (cmp == 0) {
            payment.setStatus(PaymentStatus.FULLY_ALLOCATED);
            return;
        }

        if (cmp > 0) {
            payment.setStatus(PaymentStatus.OVERPAID);
            return;
        }

        // allocated < total
        BigDecimal remaining = total.subtract(allocated);
        boolean hasOutstanding = billRepository
                .findByContractId(payment.getContract().getId())
                .stream()
                .map(invoiceBalanceCalculator::calculate)
                .anyMatch(b -> b.getOutstandingAmount() != null
                        && b.getOutstandingAmount().signum() > 0);
        payment.setStatus(hasOutstanding ? PaymentStatus.PARTIALLY_ALLOCATED : PaymentStatus.OVERPAID);
        if (remaining.signum() == 0) {
            payment.setStatus(PaymentStatus.FULLY_ALLOCATED);
        }
    }

    private Specification<Payment> searchPayments(String rawSearch) {
        String trimmed = rawSearch.trim();
        String pattern = "%" + trimmed.toLowerCase(Locale.ROOT) + "%";
        Integer searchId = tryParseInteger(trimmed);
        return (root, query, cb) -> {
            query.distinct(true);
            var contractJoin = root.join("contract", jakarta.persistence.criteria.JoinType.LEFT);
            var roomJoin = contractJoin.join("room", jakarta.persistence.criteria.JoinType.LEFT);
            var boardingHouseJoin = roomJoin.join("boardingHouse", jakarta.persistence.criteria.JoinType.LEFT);
            var tenantJoin = root.join("tenant", jakarta.persistence.criteria.JoinType.LEFT);
            var tenantUserJoin = tenantJoin.join("user", jakarta.persistence.criteria.JoinType.LEFT);

            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(cb.like(cb.lower(cb.coalesce(root.get("externalReference"), cb.literal(""))), pattern));
            predicates.add(cb.like(cb.lower(cb.coalesce(contractJoin.get("contractCode"), cb.literal(""))), pattern));
            predicates.add(cb.like(cb.lower(cb.coalesce(roomJoin.get("roomNumber"), cb.literal(""))), pattern));
            predicates.add(cb.like(cb.lower(cb.coalesce(boardingHouseJoin.get("name"), cb.literal(""))), pattern));
            predicates.add(cb.like(cb.lower(cb.coalesce(tenantUserJoin.get("fullName"), cb.literal(""))), pattern));
            predicates.add(cb.like(
                    cb.lower(cb.concat(
                            cb.coalesce(tenantUserJoin.get("firstName"), cb.literal("")),
                            cb.concat(cb.literal(" "), cb.coalesce(tenantUserJoin.get("lastName"), cb.literal(""))))),
                    pattern));
            if (searchId != null) {
                predicates.add(cb.equal(root.get("id"), searchId));
            }
            return cb.or(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    private Integer tryParseInteger(String value) {
        try {
            return Integer.valueOf(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private PaymentStatus parsePaymentStatus(String status) {
        if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) {
            return null;
        }
        try {
            return PaymentStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private PaymentSource parsePaymentSource(String source) {
        if (source == null || source.isBlank() || "ALL".equalsIgnoreCase(source)) {
            return null;
        }
        try {
            return PaymentSource.valueOf(source.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private PaymentResponse toPaymentResponse(Payment payment) {
        Map<String, Object> metadata = parsePaymentMetadata(payment.getMetadataJson());
        BigDecimal allocated = nullToZero(paymentAllocationRepository.sumAllocatedByPaymentId(payment.getId()));
        BigDecimal unallocated = nullToZero(payment.getAmount()).subtract(allocated);
        if (unallocated.signum() < 0) {
            unallocated = BigDecimal.ZERO;
        }

        List<PaymentAllocationResponse> allocations =
                paymentAllocationRepository.findByPaymentIdOrderByCreatedAtAsc(payment.getId()).stream()
                        .map(this::toAllocationResponse)
                        .toList();

        return PaymentResponse.builder()
                .id(payment.getId())
                .contractId(
                        payment.getContract() != null ? payment.getContract().getId() : null)
                .contractCode(
                        payment.getContract() != null ? payment.getContract().getContractCode() : null)
                .tenantId(payment.getTenant() != null ? payment.getTenant().getId() : null)
                .tenantName(resolveTenantName(payment))
                .roomNumber(resolveRoomNumber(payment))
                .boardingHouseName(resolveBoardingHouseName(payment))
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .externalReference(payment.getExternalReference())
                .source(payment.getSource())
                .status(payment.getStatus())
                .paymentMethod(metadataString(metadata, "paymentMethod"))
                .submittedBillId(metadataInteger(metadata, "billId"))
                .submittedBillCode(metadataString(metadata, "billCode"))
                .submittedByTenant(metadataBoolean(metadata, "submittedByTenant"))
                .createdByName(
                        payment.getCreatedBy() != null ? payment.getCreatedBy().getFullName() : null)
                .proofFileId(metadataInteger(metadata, "proofFileId"))
                .proofFileName(metadataString(metadata, "proofFileName"))
                .allocatedAmount(allocated)
                .unallocatedAmount(unallocated)
                .note(payment.getNote())
                .receivedAt(payment.getReceivedAt())
                .confirmedAt(payment.getConfirmedAt())
                .createdAt(payment.getCreatedAt())
                .allocations(allocations)
                .build();
    }

    private PaymentListItemResponse toPaymentListItemResponse(Payment payment) {
        Map<String, Object> metadata = parsePaymentMetadata(payment.getMetadataJson());
        BigDecimal allocated = nullToZero(paymentAllocationRepository.sumAllocatedByPaymentId(payment.getId()));
        BigDecimal unallocated = nullToZero(payment.getAmount()).subtract(allocated);
        if (unallocated.signum() < 0) {
            unallocated = BigDecimal.ZERO;
        }

        return PaymentListItemResponse.builder()
                .id(payment.getId())
                .contractId(
                        payment.getContract() != null ? payment.getContract().getId() : null)
                .contractCode(
                        payment.getContract() != null ? payment.getContract().getContractCode() : null)
                .tenantId(payment.getTenant() != null ? payment.getTenant().getId() : null)
                .tenantName(resolveTenantName(payment))
                .roomNumber(resolveRoomNumber(payment))
                .boardingHouseName(resolveBoardingHouseName(payment))
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .externalReference(payment.getExternalReference())
                .source(payment.getSource())
                .status(payment.getStatus())
                .paymentMethod(metadataString(metadata, "paymentMethod"))
                .submittedBillId(metadataInteger(metadata, "billId"))
                .submittedBillCode(metadataString(metadata, "billCode"))
                .submittedByTenant(metadataBoolean(metadata, "submittedByTenant"))
                .createdByName(
                        payment.getCreatedBy() != null ? payment.getCreatedBy().getFullName() : null)
                .proofFileId(metadataInteger(metadata, "proofFileId"))
                .proofFileName(metadataString(metadata, "proofFileName"))
                .allocatedAmount(allocated)
                .unallocatedAmount(unallocated)
                .note(payment.getNote())
                .receivedAt(payment.getReceivedAt())
                .confirmedAt(payment.getConfirmedAt())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    private String resolveTenantName(Payment payment) {
        if (payment.getTenant() == null || payment.getTenant().getUser() == null) {
            return null;
        }
        User user = payment.getTenant().getUser();
        if (user.getFullName() != null && !user.getFullName().isBlank()) {
            return user.getFullName();
        }
        String fullName = ((user.getFirstName() != null ? user.getFirstName() : "")
                        + " "
                        + (user.getLastName() != null ? user.getLastName() : ""))
                .trim();
        return fullName.isBlank() ? user.getUsername() : fullName;
    }

    private String resolveRoomNumber(Payment payment) {
        if (payment.getContract() == null || payment.getContract().getRoom() == null) {
            return null;
        }
        return payment.getContract().getRoom().getRoomNumber();
    }

    private String resolveBoardingHouseName(Payment payment) {
        if (payment.getContract() == null
                || payment.getContract().getRoom() == null
                || payment.getContract().getRoom().getBoardingHouse() == null) {
            return null;
        }
        return payment.getContract().getRoom().getBoardingHouse().getName();
    }

    private Map<String, Object> buildConfirmAuditMetadata(Payment payment, PaymentConfirmRequest request) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("externalReference", payment != null ? payment.getExternalReference() : null);
        metadata.put(
                "source",
                payment != null && payment.getSource() != null
                        ? payment.getSource().name()
                        : null);
        Map<String, Object> paymentMetadata = parsePaymentMetadata(payment != null ? payment.getMetadataJson() : null);
        metadata.put("billId", metadataInteger(paymentMetadata, "billId"));
        metadata.put("billCode", metadataString(paymentMetadata, "billCode"));
        metadata.put("paymentMethod", metadataString(paymentMetadata, "paymentMethod"));
        metadata.put("proofFileId", metadataInteger(paymentMetadata, "proofFileId"));
        metadata.put("proofFileName", metadataString(paymentMetadata, "proofFileName"));
        metadata.put("financeNote", request != null ? trimToNull(request.getNote()) : null);
        metadata.put("evidenceReference", request != null ? trimToNull(request.getEvidenceReference()) : null);
        return metadata;
    }

    private File resolvePaymentProofFile(Bill bill, Integer proofFileId) {
        if (proofFileId == null) {
            return null;
        }
        File proofFile = fileRepository
                .findByIdAndIsDeletedFalse(proofFileId)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));
        if (bill == null
                || bill.getContract() == null
                || proofFile.getContract() == null
                || proofFile.getContract().getId() == null
                || !proofFile.getContract().getId().equals(bill.getContract().getId())) {
            throw new AppException(ErrorCode.PAYMENT_PROOF_FILE_INVALID);
        }
        return proofFile;
    }

    private Map<String, Object> parsePaymentMetadata(String metadataJson) {
        if (metadataJson == null || metadataJson.isBlank()) {
            return Collections.emptyMap();
        }
        try {
            Object parsed = gson.fromJson(metadataJson, Object.class);
            if (parsed instanceof Map<?, ?> raw) {
                Map<String, Object> result = new LinkedHashMap<>();
                for (Map.Entry<?, ?> entry : raw.entrySet()) {
                    if (entry.getKey() != null) {
                        result.put(String.valueOf(entry.getKey()), entry.getValue());
                    }
                }
                return result;
            }
        } catch (RuntimeException ignored) {
            // metadata lỗi không được làm fail luồng payment
        }
        return Collections.emptyMap();
    }

    private String metadataString(Map<String, Object> metadata, String key) {
        if (metadata == null || key == null) {
            return null;
        }
        Object value = metadata.get(key);
        if (value == null) {
            return null;
        }
        String normalized = String.valueOf(value).trim();
        return normalized.isBlank() ? null : normalized;
    }

    private Integer metadataInteger(Map<String, Object> metadata, String key) {
        if (metadata == null || key == null) {
            return null;
        }
        Object value = metadata.get(key);
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value == null) {
            return null;
        }
        try {
            return Integer.valueOf(String.valueOf(value));
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    private Boolean metadataBoolean(Map<String, Object> metadata, String key) {
        if (metadata == null || key == null) {
            return null;
        }
        Object value = metadata.get(key);
        if (value instanceof Boolean bool) {
            return bool;
        }
        if (value == null) {
            return null;
        }
        return Boolean.parseBoolean(String.valueOf(value));
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isBlank() ? null : normalized;
    }

    private CreditLedgerEntryResponse toCreditLedgerEntryResponse(CreditLedgerEntry entry) {
        return CreditLedgerEntryResponse.builder()
                .id(entry.getId())
                .paymentId(entry.getPayment() != null ? entry.getPayment().getId() : null)
                .billId(entry.getBill() != null ? entry.getBill().getId() : null)
                .entryType(entry.getEntryType())
                .amount(entry.getAmount())
                .note(entry.getNote())
                .createdAt(entry.getCreatedAt())
                .build();
    }

    private PaymentAllocationResponse toAllocationResponse(PaymentAllocation allocation) {
        return PaymentAllocationResponse.builder()
                .id(allocation.getId())
                .paymentId(
                        allocation.getPayment() != null
                                ? allocation.getPayment().getId()
                                : null)
                .billId(allocation.getBill() != null ? allocation.getBill().getId() : null)
                .amount(allocation.getAmount())
                .allocationType(allocation.getAllocationType())
                .note(allocation.getNote())
                .createdAt(allocation.getCreatedAt())
                .build();
    }

    private void validateContractAccess(Contract contract) {
        SecurityUtils.SpecificationSafeUser safe = SecurityUtils.safeUser();
        if (safe.isAdmin()) {
            return;
        }

        Room room = contract.getRoom();
        Integer ownerId = room != null
                        && room.getBoardingHouse() != null
                        && room.getBoardingHouse().getOwner() != null
                ? room.getBoardingHouse().getOwner().getId()
                : null;

        if (ownerId == null || safe.getId() == null || !ownerId.equals(safe.getId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
    }

    private BigDecimal nullToZero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private boolean isCountableForReconciliation(Payment payment) {
        if (payment == null || payment.getStatus() == null) {
            return false;
        }
        return switch (payment.getStatus()) {
            case CONFIRMED, PARTIALLY_ALLOCATED, FULLY_ALLOCATED, OVERPAID -> true;
            default -> false;
        };
    }

    private String resolveFailureReason(RuntimeException exception) {
        if (exception instanceof AppException appException && appException.getErrorCode() != null) {
            return appException.getErrorCode().name();
        }
        return exception.getClass().getSimpleName();
    }

    private int resolveAgeDays(LocalDate dueDate, LocalDate reportDate) {
        if (dueDate == null || reportDate == null || dueDate.isAfter(reportDate)) {
            return 0;
        }
        return (int) java.time.temporal.ChronoUnit.DAYS.between(dueDate, reportDate);
    }

    private String resolveBucketCode(int ageDays) {
        if (ageDays <= 30) {
            return "0_30";
        }
        if (ageDays <= 60) {
            return "31_60";
        }
        if (ageDays <= 90) {
            return "61_90";
        }
        return "GT_90";
    }

    private record IdempotentPaymentOperationGuard(PaymentOperationLog operationLog, boolean replayExistingResult) {
        private static IdempotentPaymentOperationGuard noop() {
            return new IdempotentPaymentOperationGuard(null, false);
        }
    }
}
