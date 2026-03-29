package carevn.luv2code.ez_tro.service.admin.impl;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import carevn.luv2code.ez_tro.dto.requests.PaymentAllocateRequest;
import carevn.luv2code.ez_tro.dto.requests.PaymentAllocationItemRequest;
import carevn.luv2code.ez_tro.dto.response.InvoiceBalanceResponse;
import carevn.luv2code.ez_tro.dto.response.PaymentResponse;
import carevn.luv2code.ez_tro.entity.Bill;
import carevn.luv2code.ez_tro.entity.BoardingHouse;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.Payment;
import carevn.luv2code.ez_tro.entity.Role;
import carevn.luv2code.ez_tro.entity.Room;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.BillStatus;
import carevn.luv2code.ez_tro.enums.PaymentStatus;
import carevn.luv2code.ez_tro.repository.BillRepository;
import carevn.luv2code.ez_tro.repository.ContractRepository;
import carevn.luv2code.ez_tro.repository.PaymentAllocationRepository;
import carevn.luv2code.ez_tro.repository.PaymentRepository;
import carevn.luv2code.ez_tro.service.admin.payment.InvoiceBalanceCalculator;

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
    private InvoiceBalanceCalculator invoiceBalanceCalculator;

    @Mock
    private BillingDiscrepancyAlertService billingDiscrepancyAlertService;

    @InjectMocks
    private PaymentAllocationServiceImpl paymentAllocationService;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
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

        when(paymentRepository.findByIdForUpdate(payment.getId())).thenReturn(Optional.of(payment));
        when(paymentAllocationRepository.sumAllocatedByPaymentId(payment.getId()))
                .thenReturn(BigDecimal.ZERO);
        when(paymentAllocationRepository.sumAllocatedByBillId(bill.getId())).thenReturn(BigDecimal.ZERO);
        when(billRepository.findByIdInForUpdate(anyList())).thenReturn(List.of(bill));
        when(billRepository.findById(bill.getId())).thenReturn(Optional.of(bill));
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

        when(paymentRepository.findByIdForUpdate(payment.getId())).thenReturn(Optional.of(payment));
        when(paymentAllocationRepository.sumAllocatedByPaymentId(payment.getId()))
                .thenReturn(BigDecimal.ZERO);
        when(paymentAllocationRepository.sumAllocatedByBillId(bill.getId())).thenReturn(BigDecimal.ZERO);
        when(billRepository.findByContractIdForUpdate(contract.getId())).thenReturn(List.of(bill));
        when(billRepository.findById(bill.getId())).thenReturn(Optional.of(bill));
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

    private void authenticateAdmin() {
        Role adminRole = Role.builder().name("ADMIN").build();
        User admin = User.builder().id(1).roles(Set.of(adminRole)).build();
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(admin, null, admin.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private Contract createContract() {
        User owner = User.builder().id(2).build();
        BoardingHouse bh = new BoardingHouse();
        bh.setOwner(owner);
        Room room = Room.builder().id(1).boardingHouse(bh).build();
        return Contract.builder().id(99).room(room).build();
    }
}
