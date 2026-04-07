package carevn.luv2code.ez_tro.service.user.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import carevn.luv2code.ez_tro.dto.response.DashboardSummaryResponse;
import carevn.luv2code.ez_tro.dto.response.InvoiceBalanceResponse;
import carevn.luv2code.ez_tro.entity.Bill;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.Room;
import carevn.luv2code.ez_tro.entity.Tenant;
import carevn.luv2code.ez_tro.enums.BillLifecycleStatus;
import carevn.luv2code.ez_tro.enums.BillStatus;
import carevn.luv2code.ez_tro.repository.BillRepository;
import carevn.luv2code.ez_tro.repository.ContractRepository;
import carevn.luv2code.ez_tro.repository.TenantRepository;
import carevn.luv2code.ez_tro.service.admin.payment.InvoiceBalanceCalculator;

@ExtendWith(MockitoExtension.class)
class UserUserDashboardServiceImplTest {

    @Mock
    private TenantRepository tenantRepository;

    @Mock
    private ContractRepository contractRepository;

    @Mock
    private BillRepository billRepository;

    @Mock
    private InvoiceBalanceCalculator invoiceBalanceCalculator;

    @InjectMocks
    private UserUserDashboardServiceImpl dashboardService;

    @Test
    void getTenantSummaryInfoByUserId_shouldOnlyUseVisibleBillsFromActiveContract() {
        Integer userId = 99;
        Tenant tenant = Tenant.builder().id(5).build();
        Room activeRoom = Room.builder().id(11).roomNumber("A101").build();
        Contract activeContract = Contract.builder()
                .id(21)
                .tenant(tenant)
                .room(activeRoom)
                .startDate(LocalDate.of(2026, 1, 1))
                .rentPrice(new BigDecimal("4500000"))
                .endDate(LocalDate.of(2026, 12, 31))
                .build();
        Contract oldContract = Contract.builder()
                .id(22)
                .tenant(tenant)
                .room(Room.builder().id(12).roomNumber("B202").build())
                .build();

        Bill oldVisibleBill = Bill.builder()
                .id(1001)
                .contract(oldContract)
                .status(BillStatus.OVERDUE)
                .dueDate(LocalDate.of(2026, 2, 15))
                .build();
        Bill latestActiveBill = Bill.builder()
                .id(1002)
                .contract(activeContract)
                .status(BillStatus.PARTIALLY_PAID)
                .dueDate(LocalDate.of(2026, 4, 15))
                .build();
        Bill paidActiveBill = Bill.builder()
                .id(1003)
                .contract(activeContract)
                .status(BillStatus.PAID)
                .dueDate(LocalDate.of(2026, 3, 15))
                .build();

        when(tenantRepository.findByUserId(userId)).thenReturn(Optional.of(tenant));
        when(contractRepository.findActiveContractByTenantId(tenant.getId())).thenReturn(Optional.of(activeContract));
        when(billRepository.findVisibleToTenantByUserId(
                        userId, BillLifecycleStatus.SENT, BillLifecycleStatus.CANCELLED))
                .thenReturn(List.of(oldVisibleBill, latestActiveBill, paidActiveBill));
        when(invoiceBalanceCalculator.calculate(latestActiveBill))
                .thenReturn(InvoiceBalanceResponse.builder()
                        .outstandingAmount(new BigDecimal("1200000"))
                        .build());
        when(invoiceBalanceCalculator.calculate(paidActiveBill))
                .thenReturn(InvoiceBalanceResponse.builder()
                        .outstandingAmount(BigDecimal.ZERO)
                        .build());

        DashboardSummaryResponse response = dashboardService.getTenantSummaryInfoByUserId(userId);

        assertEquals("A101", response.getRoomNumber());
        assertEquals(new BigDecimal("4500000"), response.getMonthlyRent());
        assertEquals("Thanh toán một phần", response.getPaymentStatus());
        assertEquals(1, response.getUnpaidBillCount());
        assertEquals(new BigDecimal("1200000"), response.getOutstandingAmount());
        assertEquals(LocalDate.of(2026, 4, 15), response.getLatestBillDueDate());
        assertEquals(LocalDate.of(2026, 1, 1), response.getContractStartDate());
        assertEquals(LocalDate.of(2026, 12, 31), response.getContractEndDate());
    }

    @Test
    void getTenantSummaryInfoByUserId_shouldReturnEmptyBillStateWhenActiveContractHasNoVisibleBill() {
        Integer userId = 100;
        Tenant tenant = Tenant.builder().id(6).build();
        Contract activeContract = Contract.builder()
                .id(31)
                .tenant(tenant)
                .room(Room.builder().id(13).roomNumber("C303").build())
                .startDate(LocalDate.of(2026, 2, 1))
                .rentPrice(new BigDecimal("5000000"))
                .endDate(LocalDate.of(2026, 10, 31))
                .build();
        Contract oldContract = Contract.builder()
                .id(32)
                .tenant(tenant)
                .room(Room.builder().id(14).roomNumber("D404").build())
                .build();
        Bill oldVisibleBill = Bill.builder()
                .id(2001)
                .contract(oldContract)
                .status(BillStatus.OVERDUE)
                .dueDate(LocalDate.of(2026, 1, 15))
                .build();

        when(tenantRepository.findByUserId(userId)).thenReturn(Optional.of(tenant));
        when(contractRepository.findActiveContractByTenantId(tenant.getId())).thenReturn(Optional.of(activeContract));
        when(billRepository.findVisibleToTenantByUserId(
                        userId, BillLifecycleStatus.SENT, BillLifecycleStatus.CANCELLED))
                .thenReturn(List.of(oldVisibleBill));

        DashboardSummaryResponse response = dashboardService.getTenantSummaryInfoByUserId(userId);

        assertEquals("Chưa có hóa đơn", response.getPaymentStatus());
        assertEquals(0, response.getUnpaidBillCount());
        assertEquals(BigDecimal.ZERO, response.getOutstandingAmount());
        assertNull(response.getLatestBillDueDate());
        assertEquals(LocalDate.of(2026, 2, 1), response.getContractStartDate());
    }
}
