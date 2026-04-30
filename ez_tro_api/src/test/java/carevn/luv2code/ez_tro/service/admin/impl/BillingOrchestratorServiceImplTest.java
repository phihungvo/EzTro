package carevn.luv2code.ez_tro.service.admin.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import carevn.luv2code.ez_tro.dto.requests.InvoicePreviewRequest;
import carevn.luv2code.ez_tro.dto.response.ContractSnapshotResponse;
import carevn.luv2code.ez_tro.dto.response.ContractVersionSummaryResponse;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.Room;
import carevn.luv2code.ez_tro.enums.BillingCycle;
import carevn.luv2code.ez_tro.enums.InvoiceType;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.BillMapper;
import carevn.luv2code.ez_tro.repository.BillLineRepository;
import carevn.luv2code.ez_tro.repository.BillRepository;
import carevn.luv2code.ez_tro.repository.ContractRepository;
import carevn.luv2code.ez_tro.service.admin.BillingOperationLogService;
import carevn.luv2code.ez_tro.service.admin.ContractSnapshotService;
import carevn.luv2code.ez_tro.service.admin.NotificationService;
import carevn.luv2code.ez_tro.service.admin.ObservabilityMetricsService;
import carevn.luv2code.ez_tro.service.admin.PaymentAllocationService;
import carevn.luv2code.ez_tro.service.admin.billing.InvoiceLineBuilder;
import carevn.luv2code.ez_tro.service.admin.payment.InvoiceBalanceCalculator;

@ExtendWith(MockitoExtension.class)
class BillingOrchestratorServiceImplTest {

    @Mock
    private ContractRepository contractRepository;

    @Mock
    private BillRepository billRepository;

    @Mock
    private BillLineRepository billLineRepository;

    @Mock
    private ContractSnapshotService contractSnapshotService;

    @Mock
    private InvoiceLineBuilder invoiceLineBuilder;

    @Mock
    private BillMapper billMapper;

    @Mock
    private NotificationService notificationService;

    @Mock
    private InvoiceBalanceCalculator invoiceBalanceCalculator;

    @Mock
    private PaymentAllocationService paymentAllocationService;

    @Mock
    private ObservabilityMetricsService observabilityMetricsService;

    @Mock
    private BillingOperationLogService billingOperationLogService;

    @InjectMocks
    private BillingOrchestratorServiceImpl orchestrator;

    @Test
    void resolvePeriod_shouldRejectIncompleteBillingPeriod() throws Exception {
        Contract contract = Contract.builder()
                .id(1)
                .room(Room.builder().id(10).build())
                .startDate(LocalDate.of(2026, 3, 1))
                .build();

        ContractSnapshotResponse snapshot = ContractSnapshotResponse.builder()
                .organizationId(99)
                .currentVersion(ContractVersionSummaryResponse.builder()
                        .billingCycle(BillingCycle.MONTHLY)
                        .price(BigDecimal.ZERO)
                        .build())
                .build();

        InvoicePreviewRequest request = InvoicePreviewRequest.builder()
                .contractId(1)
                .asOfDate(LocalDate.of(2026, 3, 7))
                .billingPeriodStart(LocalDate.of(2026, 3, 1))
                .billingPeriodEnd(null)
                .invoiceType(InvoiceType.MANUAL)
                .build();

        Method resolvePeriod = BillingOrchestratorServiceImpl.class.getDeclaredMethod(
                "resolvePeriod",
                Contract.class,
                ContractSnapshotResponse.class,
                InvoicePreviewRequest.class,
                InvoiceType.class);
        resolvePeriod.setAccessible(true);

        InvocationTargetException ex = assertThrows(InvocationTargetException.class, () -> {
            resolvePeriod.invoke(orchestrator, contract, snapshot, request, InvoiceType.MANUAL);
        });

        assertEquals(ErrorCode.INVALID_PERIOD, ((AppException) ex.getCause()).getErrorCode());
    }

    @Test
    void resolvePeriod_shouldDefaultMonthlyPeriodWhenMissingRange() throws Exception {
        Contract contract = Contract.builder()
                .id(2)
                .room(Room.builder().id(20).build())
                .startDate(LocalDate.of(2026, 3, 10))
                .build();

        ContractSnapshotResponse snapshot = ContractSnapshotResponse.builder()
                .organizationId(99)
                .currentVersion(ContractVersionSummaryResponse.builder()
                        .billingCycle(BillingCycle.MONTHLY)
                        .paymentCycleMonths(1)
                        .monthlyPaymentDay(15)
                        .price(BigDecimal.ZERO)
                        .build())
                .build();

        InvoicePreviewRequest request = InvoicePreviewRequest.builder()
                .contractId(2)
                .asOfDate(LocalDate.of(2026, 3, 20))
                .invoiceType(InvoiceType.MANUAL)
                .build();

        Method resolvePeriod = BillingOrchestratorServiceImpl.class.getDeclaredMethod(
                "resolvePeriod",
                Contract.class,
                ContractSnapshotResponse.class,
                InvoicePreviewRequest.class,
                InvoiceType.class);
        resolvePeriod.setAccessible(true);

        Object result = resolvePeriod.invoke(orchestrator, contract, snapshot, request, InvoiceType.MANUAL);

        Method startAccessor = result.getClass().getDeclaredMethod("billingPeriodStart");
        Method endAccessor = result.getClass().getDeclaredMethod("billingPeriodEnd");
        startAccessor.setAccessible(true);
        endAccessor.setAccessible(true);

        assertEquals(LocalDate.of(2026, 3, 1), startAccessor.invoke(result));
        assertEquals(LocalDate.of(2026, 3, 31), endAccessor.invoke(result));
    }
}
