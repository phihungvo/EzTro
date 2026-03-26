package carevn.luv2code.ez_tro.service.admin.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.requests.PaymentAllocateRequest;
import carevn.luv2code.ez_tro.dto.requests.PaymentAllocationItemRequest;
import carevn.luv2code.ez_tro.dto.requests.PaymentReceiveRequest;
import carevn.luv2code.ez_tro.dto.requests.PaymentReverseRequest;
import carevn.luv2code.ez_tro.dto.response.InvoiceBalanceResponse;
import carevn.luv2code.ez_tro.dto.response.PaymentAllocationResponse;
import carevn.luv2code.ez_tro.dto.response.PaymentResponse;
import carevn.luv2code.ez_tro.dto.response.ReconciliationReportResponse;
import carevn.luv2code.ez_tro.entity.*;
import carevn.luv2code.ez_tro.enums.BillStatus;
import carevn.luv2code.ez_tro.enums.PaymentAllocationType;
import carevn.luv2code.ez_tro.enums.PaymentStatus;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.repository.BillRepository;
import carevn.luv2code.ez_tro.repository.ContractRepository;
import carevn.luv2code.ez_tro.repository.PaymentAllocationRepository;
import carevn.luv2code.ez_tro.repository.PaymentRepository;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.PaymentAllocationService;
import carevn.luv2code.ez_tro.service.admin.payment.InvoiceBalanceCalculator;
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

    private final PaymentRepository paymentRepository;
    private final PaymentAllocationRepository paymentAllocationRepository;
    private final ContractRepository contractRepository;
    private final BillRepository billRepository;
    private final InvoiceBalanceCalculator invoiceBalanceCalculator;

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
                .status(PaymentStatus.PENDING)
                .receivedAt(request.getReceivedAt())
                .note(request.getNote())
                .createdBy(createdBy)
                .build();

        return toPaymentResponse(paymentRepository.save(payment));
    }

    /**
     * Xác nhận một khoản thanh toán.
     *
     * @param paymentId id payment
     * @return payment DTO sau khi confirm
     */
    @Override
    @Transactional
    public PaymentResponse confirmPayment(Integer paymentId) {
        Payment payment =
                paymentRepository.findById(paymentId).orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        validateContractAccess(payment.getContract());

        if (payment.getStatus() == PaymentStatus.REVERSED || payment.getStatus() == PaymentStatus.FAILED) {
            throw new AppException(ErrorCode.PAYMENT_INVALID_STATE);
        }

        if (payment.getStatus() == PaymentStatus.PENDING) {
            payment.setStatus(PaymentStatus.CONFIRMED);
        }
        if (payment.getConfirmedAt() == null) {
            payment.setConfirmedAt(new Date());
        }

        return toPaymentResponse(paymentRepository.save(payment));
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
        Payment payment =
                paymentRepository.findById(paymentId).orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        validateContractAccess(payment.getContract());

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
            return toPaymentResponse(paymentRepository.save(payment));
        }

        List<PaymentAllocation> newAllocations = new ArrayList<>();
        Set<Integer> touchedBillIds = new HashSet<>();

        if (request != null
                && request.getAllocations() != null
                && !request.getAllocations().isEmpty()) {
            available = applyManualAllocations(payment, request, available, newAllocations, touchedBillIds);
        } else {
            available = applyAutoAllocations(payment, available, newAllocations, touchedBillIds);
        }

        if (!newAllocations.isEmpty()) {
            paymentAllocationRepository.saveAll(newAllocations);
            syncBillsAfterAllocations(touchedBillIds);
        }

        refreshPaymentStatus(payment);
        return toPaymentResponse(paymentRepository.save(payment));
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
            return toPaymentResponse(paymentRepository.save(payment));
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
        return toPaymentResponse(paymentRepository.save(payment));
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

        List<Bill> bills = billRepository.findByContractId(contractId);
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
                .filter(p -> p.getStatus() != PaymentStatus.FAILED && p.getStatus() != PaymentStatus.REVERSED)
                .map(Payment::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal creditTotal = paymentTotal.subtract(allocationTotal);
        if (creditTotal.signum() < 0) {
            creditTotal = BigDecimal.ZERO;
        }

        return ReconciliationReportResponse.builder()
                .contractId(contractId)
                .invoiceTotal(invoiceTotal)
                .paymentTotal(paymentTotal)
                .allocationTotal(allocationTotal)
                .outstandingTotal(outstandingTotal)
                .creditTotal(creditTotal)
                .invoices(invoiceBalances)
                .build();
    }

    private BigDecimal applyManualAllocations(
            Payment payment,
            PaymentAllocateRequest request,
            BigDecimal available,
            List<PaymentAllocation> newAllocations,
            Set<Integer> touchedBillIds) {

        User createdBy = SecurityUtils.getCurrentUserOrThrow();
        Map<Integer, BigDecimal> localAllocated = new HashMap<>();

        for (PaymentAllocationItemRequest item : request.getAllocations()) {
            Bill bill = billRepository
                    .findById(item.getBillId())
                    .orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));
            if (bill.getContract() == null
                    || !bill.getContract().getId().equals(payment.getContract().getId())) {
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
            Set<Integer> touchedBillIds) {

        User createdBy = SecurityUtils.getCurrentUserOrThrow();

        List<Bill> bills = billRepository.findByContractId(payment.getContract().getId()).stream()
                .filter(bill -> bill.getAmount() != null && bill.getAmount().signum() > 0)
                .sorted(Comparator.comparing(Bill::getDueDate, Comparator.nullsLast(Comparator.naturalOrder()))
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
        if (balance.getOutstandingAmount() != null
                && balance.getOutstandingAmount().signum() <= 0) {
            bill.setStatus(BillStatus.PAID);
            bill.setPaymentDate(new Date());
            return;
        }

        bill.setPaymentDate(null);
        if (bill.getDueDate() != null && bill.getDueDate().isBefore(today)) {
            bill.setStatus(BillStatus.OVERDUE);
        } else {
            bill.setStatus(BillStatus.UNPAID);
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

    private PaymentResponse toPaymentResponse(Payment payment) {
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
                .tenantId(payment.getTenant() != null ? payment.getTenant().getId() : null)
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .externalReference(payment.getExternalReference())
                .status(payment.getStatus())
                .allocatedAmount(allocated)
                .unallocatedAmount(unallocated)
                .receivedAt(payment.getReceivedAt())
                .confirmedAt(payment.getConfirmedAt())
                .createdAt(payment.getCreatedAt())
                .allocations(allocations)
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
}
