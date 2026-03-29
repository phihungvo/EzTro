package carevn.luv2code.ez_tro.service.admin.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;

import carevn.luv2code.ez_tro.dto.response.BillResponse;
import carevn.luv2code.ez_tro.dto.response.BillingOperationLogResponse;
import carevn.luv2code.ez_tro.entity.Bill;
import carevn.luv2code.ez_tro.entity.BoardingHouse;
import carevn.luv2code.ez_tro.entity.Building;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.Payment;
import carevn.luv2code.ez_tro.entity.PaymentAllocation;
import carevn.luv2code.ez_tro.entity.Room;
import carevn.luv2code.ez_tro.entity.Tenant;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.BillStatus;
import carevn.luv2code.ez_tro.enums.BillingAuditTargetType;
import carevn.luv2code.ez_tro.enums.BillingOperationType;
import carevn.luv2code.ez_tro.enums.ContractStatus;
import carevn.luv2code.ez_tro.enums.PaymentAllocationType;
import carevn.luv2code.ez_tro.enums.PaymentStatus;
import carevn.luv2code.ez_tro.enums.RoomStatus;
import carevn.luv2code.ez_tro.repository.BillRepository;
import carevn.luv2code.ez_tro.repository.BoardingHouseRepository;
import carevn.luv2code.ez_tro.repository.BuildingRepository;
import carevn.luv2code.ez_tro.repository.ContractRepository;
import carevn.luv2code.ez_tro.repository.PaymentAllocationRepository;
import carevn.luv2code.ez_tro.repository.PaymentRepository;
import carevn.luv2code.ez_tro.repository.RoomRepository;
import carevn.luv2code.ez_tro.repository.TenantRepository;
import carevn.luv2code.ez_tro.repository.UserRepository;
import carevn.luv2code.ez_tro.service.admin.BillService;
import carevn.luv2code.ez_tro.service.admin.BillingOperationLogService;
import io.minio.MinioClient;

@SpringBootTest
@ActiveProfiles("test")
class BillCancellationIT {

    @Autowired
    private BillService billService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private BoardingHouseRepository boardingHouseRepository;

    @Autowired
    private BuildingRepository buildingRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentAllocationRepository paymentAllocationRepository;

    @Autowired
    private BillingOperationLogService billingOperationLogService;

    @MockBean
    private BillingDiscrepancyAlertService billingDiscrepancyAlertService;

    @MockBean
    private MinioClient minioClient;

    private Bill bill;
    private Payment payment;

    @BeforeEach
    void setUp() {
        User ownerUser = userRepository.save(User.builder()
                .userName("owner2")
                .email("owner2@test.local")
                .password("secret")
                .roles(new HashSet<>())
                .build());

        User tenantUser = userRepository.save(User.builder()
                .userName("tenant2")
                .email("tenant2@test.local")
                .password("secret")
                .build());

        Tenant tenant = tenantRepository.save(
                Tenant.builder().user(tenantUser).owner(ownerUser).build());

        BoardingHouse boardingHouse = new BoardingHouse();
        boardingHouse.setName("BH2");
        boardingHouse.setAddress("ADDR2");
        boardingHouse.setContactPhone("0123456788");
        boardingHouse.setOwner(ownerUser);
        boardingHouse = boardingHouseRepository.save(boardingHouse);

        Building building = new Building();
        building.setName("B2");
        building.setBoardingHouse(boardingHouse);
        building = buildingRepository.save(building);

        Room room = roomRepository.save(Room.builder()
                .roomNumber("102")
                .price(new BigDecimal("1000000"))
                .boardingHouse(boardingHouse)
                .building(building)
                .status(RoomStatus.OCCUPIED)
                .build());

        Contract contract = contractRepository.save(Contract.builder()
                .contractCode("CT-002")
                .room(room)
                .tenant(tenant)
                .startDate(LocalDate.now().minusDays(10))
                .autoRenew(false)
                .rentPrice(new BigDecimal("1000000"))
                .status(ContractStatus.ACTIVE)
                .build());

        bill = billRepository.save(Bill.builder()
                .billTitle("Bill Cancel")
                .billCode("BILL-002")
                .contract(contract)
                .room(room)
                .tenant(tenant)
                .billingPeriodStart(LocalDate.now().withDayOfMonth(1))
                .billingPeriodEnd(LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth()))
                .amount(new BigDecimal("1000000"))
                .serviceAmount(BigDecimal.ZERO)
                .dueDate(LocalDate.now().plusDays(5))
                .status(BillStatus.UNPAID)
                .build());

        payment = paymentRepository.save(Payment.builder()
                .contract(contract)
                .tenant(tenant)
                .amount(new BigDecimal("1000000"))
                .currency("VND")
                .externalReference("PAY-002")
                .status(PaymentStatus.PARTIALLY_ALLOCATED)
                .build());

        paymentAllocationRepository.save(PaymentAllocation.builder()
                .payment(payment)
                .bill(bill)
                .amount(new BigDecimal("400000"))
                .allocationType(PaymentAllocationType.ALLOCATE)
                .build());

        authenticateOwner(ownerUser);
        when(billingDiscrepancyAlertService.thresholdOrZero()).thenReturn(BigDecimal.ZERO);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void cancelBill_shouldReverseAllocationsAndSetCancelled() {
        BillResponse response = billService.cancel(bill.getId());

        assertEquals(BillStatus.CANCELLED, response.getStatus());

        BigDecimal netAllocated = paymentAllocationRepository.sumAllocatedByBillId(bill.getId());
        assertNotNull(netAllocated);
        assertEquals(0, netAllocated.compareTo(BigDecimal.ZERO));

        BigDecimal netAllocatedByPayment = paymentAllocationRepository.sumAllocatedByPaymentId(payment.getId());
        assertNotNull(netAllocatedByPayment);
        assertEquals(0, netAllocatedByPayment.compareTo(BigDecimal.ZERO));

        Payment refreshedPayment = paymentRepository.findById(payment.getId()).orElseThrow();
        assertEquals(PaymentStatus.CONFIRMED, refreshedPayment.getStatus());

        List<PaymentAllocation> allocations = paymentAllocationRepository.findByBillId(bill.getId());
        long reversalCount = allocations.stream()
                .filter(allocation -> allocation.getAllocationType() == PaymentAllocationType.REVERSAL)
                .count();
        assertEquals(1, reversalCount);

        BigDecimal reversalAmount = allocations.stream()
                .filter(allocation -> allocation.getAllocationType() == PaymentAllocationType.REVERSAL)
                .map(PaymentAllocation::getAmount)
                .findFirst()
                .orElse(BigDecimal.ZERO);
        assertEquals(0, reversalAmount.compareTo(new BigDecimal("-400000")));

        List<BillingOperationLogResponse> logs =
                billingOperationLogService.getLogs(null, BillingAuditTargetType.BILL, bill.getId());
        assertFalse(logs.isEmpty());

        BillingOperationLogResponse cancelLog = logs.stream()
                .filter(log -> log.getOperationType() == BillingOperationType.BILL_CANCEL)
                .findFirst()
                .orElseThrow();
        assertNotNull(cancelLog.getBeforeState());
        assertNotNull(cancelLog.getAfterState());

        @SuppressWarnings("unchecked")
        var beforeState = (java.util.Map<String, Object>) cancelLog.getBeforeState();
        @SuppressWarnings("unchecked")
        var afterState = (java.util.Map<String, Object>) cancelLog.getAfterState();

        assertEquals("UNPAID", beforeState.get("status"));
        assertEquals("CANCELLED", afterState.get("status"));
    }

    private void authenticateOwner(User owner) {
        // Giả lập owner để pass validateContractAccess.
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(owner, null, owner.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}
