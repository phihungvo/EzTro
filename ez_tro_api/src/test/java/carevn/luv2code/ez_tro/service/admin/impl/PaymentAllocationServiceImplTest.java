package carevn.luv2code.ez_tro.service.admin.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.atomic.AtomicReference;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import carevn.luv2code.ez_tro.configuration.RequestIdFilter;
import carevn.luv2code.ez_tro.dto.requests.PaymentAllocateRequest;
import carevn.luv2code.ez_tro.dto.requests.PaymentAllocationItemRequest;
import carevn.luv2code.ez_tro.dto.response.CreditLedgerReportResponse;
import carevn.luv2code.ez_tro.dto.response.DebtAgingReportResponse;
import carevn.luv2code.ez_tro.dto.response.InvoiceBalanceResponse;
import carevn.luv2code.ez_tro.dto.response.PaymentListItemResponse;
import carevn.luv2code.ez_tro.dto.response.PaymentResponse;
import carevn.luv2code.ez_tro.entity.Bill;
import carevn.luv2code.ez_tro.entity.BoardingHouse;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.CreditLedgerEntry;
import carevn.luv2code.ez_tro.entity.Organization;
import carevn.luv2code.ez_tro.entity.Payment;
import carevn.luv2code.ez_tro.entity.PaymentAllocation;
import carevn.luv2code.ez_tro.entity.PaymentOperationLog;
import carevn.luv2code.ez_tro.entity.Role;
import carevn.luv2code.ez_tro.entity.Room;
import carevn.luv2code.ez_tro.entity.Tenant;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.BillStatus;
import carevn.luv2code.ez_tro.enums.CreditLedgerEntryType;
import carevn.luv2code.ez_tro.enums.PaymentOperationStatus;
import carevn.luv2code.ez_tro.enums.PaymentOperationType;
import carevn.luv2code.ez_tro.enums.PaymentStatus;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.repository.BillRepository;
import carevn.luv2code.ez_tro.repository.ContractRepository;
import carevn.luv2code.ez_tro.repository.CreditLedgerEntryRepository;
import carevn.luv2code.ez_tro.repository.PaymentAllocationRepository;
import carevn.luv2code.ez_tro.repository.PaymentOperationLogRepository;
import carevn.luv2code.ez_tro.repository.PaymentRepository;
import carevn.luv2code.ez_tro.service.admin.BillingOperationLogService;
import carevn.luv2code.ez_tro.service.admin.ObservabilityMetricsService;
import carevn.luv2code.ez_tro.service.admin.payment.InvoiceBalanceCalculator;
import carevn.luv2code.ez_tro.util.RequestAuditUtils;

@ExtendWith(MockitoExtension.class)
class PaymentAllocationServiceImplTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private PaymentAllocationRepository paymentAllocationRepository;

    @Mock
    private ContractRepository contractRepository;

    @Mock
    private BillRepository billRepository;

    @Mock
    private CreditLedgerEntryRepository creditLedgerEntryRepository;

    @Mock
    private InvoiceBalanceCalculator invoiceBalanceCalculator;

    @Mock
    private BillingDiscrepancyAlertService billingDiscrepancyAlertService;

    @Mock
    private PaymentOperationLogRepository paymentOperationLogRepository;

    @Mock
    private BillingOperationLogService billingOperationLogService;

    @Mock
    private ObservabilityMetricsService observabilityMetricsService;

    @InjectMocks
    private PaymentAllocationServiceImpl paymentAllocationService;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void allocatePayment_manual_shouldUsePessimisticLocks() {
        authenticateAdmin();

        // Thiết lập dữ liệu để kiểm tra luồng manual allocation có khóa Payment + Bills.
        Contract contract = createContract();
        Payment payment = Payment.builder()
                .id(10)
                .contract(contract)
                .amount(new BigDecimal("1000000"))
                .status(PaymentStatus.PENDING)
                .build();

        Bill bill = Bill.builder()
                .id(100)
                .contract(contract)
                .amount(new BigDecimal("500000"))
                .dueDate(LocalDate.now().plusDays(5))
                .status(BillStatus.UNPAID)
                .build();

        PaymentAllocateRequest request = PaymentAllocateRequest.builder()
                .allocations(List.of(PaymentAllocationItemRequest.builder()
                        .billId(bill.getId())
                        .amount(new BigDecimal("200000"))
                        .build()))
                .note("alloc")
                .build();

        when(paymentRepository.findById(anyInt())).thenReturn(Optional.of(payment));
        when(paymentRepository.findByIdForUpdate(anyInt())).thenReturn(Optional.of(payment));
        when(contractRepository.findById(contract.getId())).thenReturn(Optional.of(contract));
        when(paymentAllocationRepository.sumAllocatedByPaymentId(payment.getId()))
                .thenReturn(BigDecimal.ZERO);
        when(paymentAllocationRepository.sumAllocatedByBillId(bill.getId())).thenReturn(BigDecimal.ZERO);
        when(billRepository.findByIdInForUpdate(anyList())).thenReturn(List.of(bill));
        when(billRepository.findByContractId(contract.getId())).thenReturn(List.of(bill));
        when(billRepository.findById(bill.getId())).thenReturn(Optional.of(bill));
        when(paymentRepository.findByContractIdOrderByReceivedAtAsc(contract.getId()))
                .thenReturn(List.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(paymentAllocationRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));
        when(paymentAllocationRepository.findByPaymentIdOrderByCreatedAtAsc(payment.getId()))
                .thenReturn(List.of());
        when(invoiceBalanceCalculator.calculate(bill))
                .thenReturn(InvoiceBalanceResponse.builder()
                        .billId(bill.getId())
                        .invoiceTotal(bill.getAmount())
                        .allocatedAmount(BigDecimal.ZERO)
                        .outstandingAmount(bill.getAmount())
                        .build());
        when(billingDiscrepancyAlertService.thresholdOrZero()).thenReturn(BigDecimal.ZERO);

        PaymentResponse response = paymentAllocationService.allocatePayment(payment.getId(), request);

        assertNotNull(response);
        verify(paymentRepository, times(1)).findByIdForUpdate(payment.getId());
        verify(billRepository, times(1)).findByIdInForUpdate(anyList());
        verify(billRepository, never()).findByContractIdForUpdate(anyInt());
    }

    @Test
    void allocatePayment_auto_shouldLockContractBills() {
        authenticateAdmin();

        // Luồng auto allocation phải khóa toàn bộ bill của hợp đồng để tránh double allocate.
        Contract contract = createContract();
        Payment payment = Payment.builder()
                .id(11)
                .contract(contract)
                .amount(new BigDecimal("1000000"))
                .status(PaymentStatus.PENDING)
                .build();

        Bill bill = Bill.builder()
                .id(101)
                .contract(contract)
                .amount(new BigDecimal("500000"))
                .dueDate(LocalDate.now().plusDays(5))
                .status(BillStatus.UNPAID)
                .build();

        when(paymentRepository.findById(anyInt())).thenReturn(Optional.of(payment));
        when(paymentRepository.findByIdForUpdate(anyInt())).thenReturn(Optional.of(payment));
        when(contractRepository.findById(contract.getId())).thenReturn(Optional.of(contract));
        when(paymentAllocationRepository.sumAllocatedByPaymentId(payment.getId()))
                .thenReturn(BigDecimal.ZERO);
        when(paymentAllocationRepository.sumAllocatedByBillId(bill.getId())).thenReturn(BigDecimal.ZERO);
        when(billRepository.findByContractIdForUpdate(contract.getId())).thenReturn(List.of(bill));
        when(billRepository.findByContractId(contract.getId())).thenReturn(List.of(bill));
        when(billRepository.findById(bill.getId())).thenReturn(Optional.of(bill));
        when(paymentRepository.findByContractIdOrderByReceivedAtAsc(contract.getId()))
                .thenReturn(List.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(paymentAllocationRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));
        when(paymentAllocationRepository.findByPaymentIdOrderByCreatedAtAsc(payment.getId()))
                .thenReturn(List.of());
        when(invoiceBalanceCalculator.calculate(bill))
                .thenReturn(InvoiceBalanceResponse.builder()
                        .billId(bill.getId())
                        .invoiceTotal(bill.getAmount())
                        .allocatedAmount(BigDecimal.ZERO)
                        .outstandingAmount(bill.getAmount())
                        .build());
        when(billingDiscrepancyAlertService.thresholdOrZero()).thenReturn(BigDecimal.ZERO);

        PaymentResponse response = paymentAllocationService.allocatePayment(payment.getId(), null);

        assertNotNull(response);
        verify(paymentRepository, times(1)).findByIdForUpdate(payment.getId());
        verify(billRepository, times(1)).findByContractIdForUpdate(contract.getId());
        verify(billRepository, never()).findByIdInForUpdate(anyList());
    }

    @Test
    void allocatePayment_sameIdempotencyKey_shouldReplayWithoutDuplicatingAllocations() {
        authenticateAdmin();
        bindRequest("allocate-1", "req-allocate-1");

        Contract contract = createContract();
        Payment payment = Payment.builder()
                .id(12)
                .contract(contract)
                .amount(new BigDecimal("1000000"))
                .status(PaymentStatus.PENDING)
                .build();
        Bill bill = Bill.builder()
                .id(102)
                .contract(contract)
                .amount(new BigDecimal("500000"))
                .dueDate(LocalDate.now().plusDays(5))
                .status(BillStatus.UNPAID)
                .build();
        PaymentAllocateRequest request = PaymentAllocateRequest.builder()
                .allocations(List.of(PaymentAllocationItemRequest.builder()
                        .billId(bill.getId())
                        .amount(new BigDecimal("200000"))
                        .build()))
                .note("alloc")
                .build();

        AtomicReference<PaymentOperationLog> operationLogRef = new AtomicReference<>();
        AtomicReference<List<PaymentAllocation>> savedAllocationsRef = new AtomicReference<>(List.of());

        when(paymentRepository.findById(payment.getId())).thenReturn(Optional.of(payment));
        when(paymentRepository.findByIdForUpdate(payment.getId())).thenReturn(Optional.of(payment));
        when(contractRepository.findById(contract.getId())).thenReturn(Optional.of(contract));
        when(paymentOperationLogRepository.findByTargetKeyAndOperationTypeAndIdempotencyKey(
                        "PAYMENT:12", PaymentOperationType.ALLOCATE, "allocate-1"))
                .thenAnswer(invocation -> Optional.ofNullable(operationLogRef.get()));
        when(paymentOperationLogRepository.saveAndFlush(any(PaymentOperationLog.class)))
                .thenAnswer(invocation -> {
                    PaymentOperationLog log = invocation.getArgument(0);
                    log.setId(1);
                    operationLogRef.set(log);
                    return log;
                });
        when(paymentOperationLogRepository.save(any(PaymentOperationLog.class))).thenAnswer(invocation -> {
            PaymentOperationLog log = invocation.getArgument(0);
            operationLogRef.set(log);
            return log;
        });
        when(paymentAllocationRepository.sumAllocatedByPaymentId(payment.getId()))
                .thenReturn(BigDecimal.ZERO, new BigDecimal("200000"), new BigDecimal("200000"));
        when(paymentAllocationRepository.sumAllocatedByBillId(bill.getId())).thenReturn(BigDecimal.ZERO);
        when(billRepository.findByIdInForUpdate(anyList())).thenReturn(List.of(bill));
        when(billRepository.findById(bill.getId())).thenReturn(Optional.of(bill));
        when(billRepository.findByContractId(contract.getId())).thenReturn(List.of(bill));
        when(paymentRepository.findByContractIdOrderByReceivedAtAsc(contract.getId()))
                .thenReturn(List.of(payment));
        when(paymentAllocationRepository.findByPaymentIdOrderByCreatedAtAsc(payment.getId()))
                .thenAnswer(invocation -> savedAllocationsRef.get());
        when(paymentAllocationRepository.saveAll(anyList())).thenAnswer(invocation -> {
            List<PaymentAllocation> allocations = new ArrayList<>(invocation.getArgument(0));
            for (int i = 0; i < allocations.size(); i++) {
                allocations.get(i).setId(i + 1);
            }
            savedAllocationsRef.set(List.copyOf(allocations));
            return allocations;
        });
        when(invoiceBalanceCalculator.calculate(bill))
                .thenReturn(InvoiceBalanceResponse.builder()
                        .billId(bill.getId())
                        .invoiceTotal(bill.getAmount())
                        .allocatedAmount(new BigDecimal("200000"))
                        .outstandingAmount(new BigDecimal("300000"))
                        .build());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(billRepository.save(any(Bill.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(billingDiscrepancyAlertService.thresholdOrZero()).thenReturn(BigDecimal.ZERO);

        PaymentResponse firstResponse = paymentAllocationService.allocatePayment(payment.getId(), request);
        PaymentResponse secondResponse = paymentAllocationService.allocatePayment(payment.getId(), request);

        assertNotNull(firstResponse);
        assertNotNull(secondResponse);
        assertEquals(firstResponse.getId(), secondResponse.getId());
        assertEquals(0, firstResponse.getAllocatedAmount().compareTo(secondResponse.getAllocatedAmount()));
        assertEquals(firstResponse.getStatus(), secondResponse.getStatus());
        assertEquals(1, secondResponse.getAllocations().size());
        verify(paymentAllocationRepository, times(1)).saveAll(anyList());
        verify(paymentOperationLogRepository, times(1)).saveAndFlush(any(PaymentOperationLog.class));
        verify(paymentOperationLogRepository, times(1)).save(any(PaymentOperationLog.class));
        assertEquals(PaymentOperationStatus.COMPLETED, operationLogRef.get().getStatus());
    }

    @Test
    void allocatePayment_shouldRequireIdempotencyKeyWhenRequestContextExists() {
        authenticateAdmin();
        bindRequest(null, "req-allocate-missing-key");

        Contract contract = createContract();
        Payment payment = Payment.builder()
                .id(13)
                .contract(contract)
                .amount(new BigDecimal("1000000"))
                .status(PaymentStatus.PENDING)
                .build();

        when(paymentRepository.findById(payment.getId())).thenReturn(Optional.of(payment));

        AppException exception = assertThrows(
                AppException.class,
                () -> paymentAllocationService.allocatePayment(
                        payment.getId(), PaymentAllocateRequest.builder().build()));

        assertEquals(ErrorCode.PAYMENT_IDEMPOTENCY_KEY_REQUIRED, exception.getErrorCode());
        verify(paymentRepository, never()).findByIdForUpdate(anyInt());
        verify(paymentOperationLogRepository, never()).saveAndFlush(any(PaymentOperationLog.class));
    }

    @Test
    void allocatePayment_shouldRejectManualAllocationAmountLessThanOrEqualToZero() {
        authenticateAdmin();

        PaymentAllocateRequest request = PaymentAllocateRequest.builder()
                .allocations(List.of(PaymentAllocationItemRequest.builder()
                        .billId(100)
                        .amount(BigDecimal.ZERO)
                        .build()))
                .build();

        AppException exception =
                assertThrows(AppException.class, () -> paymentAllocationService.allocatePayment(15, request));

        assertEquals(ErrorCode.PAYMENT_ALLOCATION_AMOUNT_INVALID, exception.getErrorCode());
        verify(paymentRepository, never()).findById(anyInt());
        verify(paymentRepository, never()).findByIdForUpdate(anyInt());
        verify(paymentAllocationRepository, never()).saveAll(anyList());
    }

    @Test
    void confirmPayment_shouldCreateCreditLedgerEntryForUnallocatedBalance() {
        authenticateAdmin();

        Contract contract = createContract();
        contract.setOrganization(Organization.builder().id(5).build());
        Payment payment = Payment.builder()
                .id(14)
                .contract(contract)
                .organization(contract.getOrganization())
                .amount(new BigDecimal("500000"))
                .status(PaymentStatus.PENDING)
                .build();

        when(paymentRepository.findById(payment.getId())).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(paymentAllocationRepository.sumAllocatedByPaymentId(payment.getId()))
                .thenReturn(BigDecimal.ZERO);
        when(paymentAllocationRepository.findByPaymentIdOrderByCreatedAtAsc(payment.getId()))
                .thenReturn(List.of());
        when(creditLedgerEntryRepository.sumAmountByPaymentId(payment.getId())).thenReturn(BigDecimal.ZERO);
        when(creditLedgerEntryRepository.save(any(CreditLedgerEntry.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        PaymentResponse response = paymentAllocationService.confirmPayment(payment.getId());

        assertNotNull(response);
        assertEquals(PaymentStatus.CONFIRMED, response.getStatus());
        verify(creditLedgerEntryRepository)
                .save(argThat(entry -> entry.getEntryType() == CreditLedgerEntryType.CREDIT_ISSUED
                        && entry.getPayment() != null
                        && payment.getId().equals(entry.getPayment().getId())
                        && 0 == new BigDecimal("500000").compareTo(entry.getAmount())));
    }

    @Test
    void applyCarryForwardCredits_shouldAllocateExistingCreditToBill() {
        authenticateAdmin();

        Contract contract = createContract();
        contract.setOrganization(Organization.builder().id(7).build());
        Bill bill = Bill.builder()
                .id(301)
                .contract(contract)
                .amount(new BigDecimal("300000"))
                .dueDate(LocalDate.now().plusDays(3))
                .status(BillStatus.UNPAID)
                .build();
        Payment payment = Payment.builder()
                .id(21)
                .contract(contract)
                .organization(contract.getOrganization())
                .amount(new BigDecimal("500000"))
                .status(PaymentStatus.CONFIRMED)
                .build();

        when(billRepository.findByIdInForUpdate(List.of(bill.getId()))).thenReturn(List.of(bill));
        when(billRepository.findById(bill.getId())).thenReturn(Optional.of(bill));
        when(billRepository.findByContractId(contract.getId())).thenReturn(List.of(bill));
        when(paymentRepository.findByContractIdAndStatusInForUpdate(eq(contract.getId()), anySet()))
                .thenReturn(List.of(payment));
        when(paymentRepository.findByContractIdOrderByReceivedAtAsc(contract.getId()))
                .thenReturn(List.of(payment));
        when(paymentAllocationRepository.sumAllocatedByPaymentId(payment.getId()))
                .thenReturn(BigDecimal.ZERO, new BigDecimal("300000"), new BigDecimal("300000"));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(billRepository.save(any(Bill.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(paymentAllocationRepository.saveAll(anyList())).thenAnswer(invocation -> {
            List<PaymentAllocation> allocations = invocation.getArgument(0);
            for (int i = 0; i < allocations.size(); i++) {
                allocations.get(i).setId(i + 1);
            }
            return allocations;
        });
        when(creditLedgerEntryRepository.sumAmountByPaymentId(payment.getId())).thenReturn(new BigDecimal("500000"));
        when(creditLedgerEntryRepository.save(any(CreditLedgerEntry.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(invoiceBalanceCalculator.calculate(bill))
                .thenReturn(
                        InvoiceBalanceResponse.builder()
                                .billId(bill.getId())
                                .invoiceTotal(bill.getAmount())
                                .allocatedAmount(BigDecimal.ZERO)
                                .outstandingAmount(new BigDecimal("300000"))
                                .build(),
                        InvoiceBalanceResponse.builder()
                                .billId(bill.getId())
                                .invoiceTotal(bill.getAmount())
                                .allocatedAmount(new BigDecimal("300000"))
                                .outstandingAmount(BigDecimal.ZERO)
                                .build(),
                        InvoiceBalanceResponse.builder()
                                .billId(bill.getId())
                                .invoiceTotal(bill.getAmount())
                                .allocatedAmount(new BigDecimal("300000"))
                                .outstandingAmount(BigDecimal.ZERO)
                                .build());
        when(billingDiscrepancyAlertService.thresholdOrZero()).thenReturn(BigDecimal.ZERO);

        paymentAllocationService.applyCarryForwardCredits(bill.getId());

        verify(paymentAllocationRepository)
                .saveAll(argThat((List<PaymentAllocation> allocations) -> allocations.size() == 1
                        && allocations.getFirst().getPayment() != null
                        && payment.getId()
                                .equals(allocations.getFirst().getPayment().getId())
                        && allocations.getFirst().getBill() != null
                        && bill.getId().equals(allocations.getFirst().getBill().getId())
                        && 0
                                == new BigDecimal("300000")
                                        .compareTo(allocations.getFirst().getAmount())));
        verify(creditLedgerEntryRepository)
                .save(argThat(entry -> entry.getEntryType() == CreditLedgerEntryType.CREDIT_APPLIED
                        && entry.getBill() != null
                        && bill.getId().equals(entry.getBill().getId())
                        && 0 == new BigDecimal("-300000").compareTo(entry.getAmount())));
        assertEquals(PaymentStatus.OVERPAID, payment.getStatus());
    }

    @Test
    void getCreditLedgerReport_shouldReturnCurrentBalanceAndEntries() {
        authenticateAdmin();

        Contract contract = createContract();
        Payment payment = Payment.builder().id(31).build();
        Bill bill = Bill.builder().id(401).build();
        CreditLedgerEntry entry = CreditLedgerEntry.builder()
                .id(1)
                .contract(contract)
                .payment(payment)
                .bill(bill)
                .entryType(CreditLedgerEntryType.CREDIT_ISSUED)
                .amount(new BigDecimal("250000"))
                .note("credit")
                .build();

        when(contractRepository.findById(contract.getId())).thenReturn(Optional.of(contract));
        when(creditLedgerEntryRepository.findByContractIdOrderByCreatedAtAscIdAsc(contract.getId()))
                .thenReturn(List.of(entry));
        when(creditLedgerEntryRepository.sumAmountByContractId(contract.getId()))
                .thenReturn(new BigDecimal("250000"));

        CreditLedgerReportResponse response = paymentAllocationService.getCreditLedgerReport(contract.getId());

        assertNotNull(response);
        assertEquals(contract.getId(), response.getContractId());
        assertEquals(0, new BigDecimal("250000").compareTo(response.getCurrentBalance()));
        assertEquals(1, response.getEntries().size());
        assertEquals(
                CreditLedgerEntryType.CREDIT_ISSUED,
                response.getEntries().getFirst().getEntryType());
    }

    @Test
    void getDebtAgingReport_shouldBucketOutstandingByDueDate() {
        authenticateAdmin();

        Contract contract = createContract();
        Bill currentBucket = Bill.builder()
                .id(201)
                .contract(contract)
                .billCode("B201")
                .billTitle("Current")
                .amount(new BigDecimal("100000"))
                .dueDate(LocalDate.now().minusDays(10))
                .status(BillStatus.UNPAID)
                .build();
        Bill mediumBucket = Bill.builder()
                .id(202)
                .contract(contract)
                .billCode("B202")
                .billTitle("Medium")
                .amount(new BigDecimal("200000"))
                .dueDate(LocalDate.now().minusDays(45))
                .status(BillStatus.OVERDUE)
                .build();
        Bill oldBucket = Bill.builder()
                .id(203)
                .contract(contract)
                .billCode("B203")
                .billTitle("Old")
                .amount(new BigDecimal("300000"))
                .dueDate(LocalDate.now().minusDays(95))
                .status(BillStatus.OVERDUE)
                .build();

        when(contractRepository.findById(contract.getId())).thenReturn(Optional.of(contract));
        when(billRepository.findByContractId(contract.getId()))
                .thenReturn(List.of(currentBucket, mediumBucket, oldBucket));
        when(invoiceBalanceCalculator.calculate(currentBucket))
                .thenReturn(InvoiceBalanceResponse.builder()
                        .billId(currentBucket.getId())
                        .invoiceTotal(currentBucket.getAmount())
                        .outstandingAmount(new BigDecimal("100000"))
                        .build());
        when(invoiceBalanceCalculator.calculate(mediumBucket))
                .thenReturn(InvoiceBalanceResponse.builder()
                        .billId(mediumBucket.getId())
                        .invoiceTotal(mediumBucket.getAmount())
                        .outstandingAmount(new BigDecimal("200000"))
                        .build());
        when(invoiceBalanceCalculator.calculate(oldBucket))
                .thenReturn(InvoiceBalanceResponse.builder()
                        .billId(oldBucket.getId())
                        .invoiceTotal(oldBucket.getAmount())
                        .outstandingAmount(new BigDecimal("300000"))
                        .build());

        DebtAgingReportResponse response = paymentAllocationService.getDebtAgingReport(contract.getId());

        assertNotNull(response);
        assertEquals(0, new BigDecimal("600000").compareTo(response.getTotalOutstanding()));
        assertEquals(3, response.getInvoices().size());
        assertEquals(
                0,
                new BigDecimal("100000")
                        .compareTo(response.getBuckets().stream()
                                .filter(bucket -> "0_30".equals(bucket.getBucketCode()))
                                .findFirst()
                                .orElseThrow()
                                .getOutstandingAmount()));
        assertEquals(
                0,
                new BigDecimal("200000")
                        .compareTo(response.getBuckets().stream()
                                .filter(bucket -> "31_60".equals(bucket.getBucketCode()))
                                .findFirst()
                                .orElseThrow()
                                .getOutstandingAmount()));
        assertEquals(
                0,
                new BigDecimal("300000")
                        .compareTo(response.getBuckets().stream()
                                .filter(bucket -> "GT_90".equals(bucket.getBucketCode()))
                                .findFirst()
                                .orElseThrow()
                                .getOutstandingAmount()));
    }

    @Test
    void filterPayments_shouldReturnPagedSummariesWithDisplayMetadata() {
        authenticateAdmin();

        Contract contract = createContract();
        Payment payment = Payment.builder()
                .id(55)
                .contract(contract)
                .tenant(contract.getTenant())
                .amount(new BigDecimal("450000"))
                .currency("VND")
                .externalReference("CK-55")
                .status(PaymentStatus.CONFIRMED)
                .note("bank transfer")
                .build();

        Page<Payment> paymentPage = new PageImpl<>(List.of(payment), PageRequest.of(0, 10), 1);
        when(paymentRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(paymentPage);
        when(paymentAllocationRepository.sumAllocatedByPaymentId(payment.getId()))
                .thenReturn(new BigDecimal("150000"));

        Page<PaymentListItemResponse> response =
                paymentAllocationService.filterPayments("CK", "CONFIRMED", "NORMAL", null, null, null, 0, 10);

        assertNotNull(response);
        assertEquals(1, response.getTotalElements());
        assertEquals("CT-099", response.getContent().getFirst().getContractCode());
        assertEquals("A-101", response.getContent().getFirst().getRoomNumber());
        assertEquals("Sunrise House", response.getContent().getFirst().getBoardingHouseName());
        assertEquals("Nguyen Van A", response.getContent().getFirst().getTenantName());
        assertEquals(
                0,
                new BigDecimal("300000")
                        .compareTo(response.getContent().getFirst().getUnallocatedAmount()));
    }

    @Test
    void getPayment_shouldIncludeDisplayMetadata() {
        authenticateAdmin();

        Contract contract = createContract();
        Payment payment = Payment.builder()
                .id(56)
                .contract(contract)
                .tenant(contract.getTenant())
                .amount(new BigDecimal("600000"))
                .currency("VND")
                .externalReference("CK-56")
                .status(PaymentStatus.PENDING)
                .note("cash desk")
                .build();

        when(paymentRepository.findById(payment.getId())).thenReturn(Optional.of(payment));
        when(paymentAllocationRepository.sumAllocatedByPaymentId(payment.getId()))
                .thenReturn(BigDecimal.ZERO);
        when(paymentAllocationRepository.findByPaymentIdOrderByCreatedAtAsc(payment.getId()))
                .thenReturn(List.of());

        PaymentResponse response = paymentAllocationService.getPayment(payment.getId());

        assertNotNull(response);
        assertEquals("CT-099", response.getContractCode());
        assertEquals("A-101", response.getRoomNumber());
        assertEquals("Sunrise House", response.getBoardingHouseName());
        assertEquals("Nguyen Van A", response.getTenantName());
        assertEquals("cash desk", response.getNote());
    }

    private void authenticateAdmin() {
        Role adminRole = Role.builder().name("ADMIN").build();
        User admin = User.builder().id(1).roles(Set.of(adminRole)).build();
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(admin, null, admin.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private Contract createContract() {
        User owner = User.builder().id(2).build();
        User tenantUser = User.builder()
                .id(3)
                .firstName("Nguyen")
                .lastName("Van A")
                .fullName("Nguyen Van A")
                .userName("tenant-a")
                .build();
        Tenant tenant = Tenant.builder().id(8).user(tenantUser).owner(owner).build();
        BoardingHouse bh = new BoardingHouse();
        bh.setOwner(owner);
        bh.setName("Sunrise House");
        Room room = Room.builder().id(1).roomNumber("A-101").boardingHouse(bh).build();
        return Contract.builder()
                .id(99)
                .contractCode("CT-099")
                .room(room)
                .tenant(tenant)
                .build();
    }

    private void bindRequest(String idempotencyKey, String requestId) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        if (idempotencyKey != null) {
            request.addHeader(RequestAuditUtils.IDEMPOTENCY_KEY_HEADER, idempotencyKey);
        }
        request.setAttribute(RequestIdFilter.REQUEST_ID_ATTRIBUTE, requestId);
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
    }
}
