package carevn.luv2code.ez_tro.service.admin.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.UnexpectedRollbackException;
import org.springframework.transaction.support.TransactionTemplate;

import carevn.luv2code.ez_tro.dto.requests.PaymentAllocateRequest;
import carevn.luv2code.ez_tro.dto.requests.PaymentAllocationItemRequest;
import carevn.luv2code.ez_tro.entity.Bill;
import carevn.luv2code.ez_tro.entity.BoardingHouse;
import carevn.luv2code.ez_tro.entity.Building;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.Payment;
import carevn.luv2code.ez_tro.entity.Room;
import carevn.luv2code.ez_tro.entity.Tenant;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.BillStatus;
import carevn.luv2code.ez_tro.enums.ContractStatus;
import carevn.luv2code.ez_tro.enums.PaymentStatus;
import carevn.luv2code.ez_tro.enums.RoomStatus;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.repository.BillRepository;
import carevn.luv2code.ez_tro.repository.BoardingHouseRepository;
import carevn.luv2code.ez_tro.repository.BuildingRepository;
import carevn.luv2code.ez_tro.repository.ContractRepository;
import carevn.luv2code.ez_tro.repository.PaymentAllocationRepository;
import carevn.luv2code.ez_tro.repository.PaymentRepository;
import carevn.luv2code.ez_tro.repository.RoomRepository;
import carevn.luv2code.ez_tro.repository.TenantRepository;
import carevn.luv2code.ez_tro.repository.UserRepository;
import carevn.luv2code.ez_tro.service.admin.PaymentAllocationService;
import io.minio.MinioClient;

@SpringBootTest
@ActiveProfiles("test")
class PaymentAllocationConcurrencyIT {

    @Autowired
    private PaymentAllocationService paymentAllocationService;

    @Autowired
    private PlatformTransactionManager transactionManager;

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

    @MockBean
    private BillingDiscrepancyAlertService billingDiscrepancyAlertService;

    @MockBean
    private CronJobServiceImpl cronJobService;

    @MockBean
    private MinioClient minioClient;

    private User ownerUser;
    private Contract contract;
    private Bill bill;
    private Payment payment;

    @BeforeEach
    void setUp() {
        // Chuẩn bị dữ liệu tối thiểu để chạy luồng allocate thực tế trên DB.
        ownerUser = userRepository.save(User.builder()
                .userName("owner")
                .email("owner@test.local")
                .password("secret")
                // Không gán role để tránh lỗi FK khi lưu user (role không được persist).
                .roles(new HashSet<>())
                .build());

        User tenantUser = userRepository.save(User.builder()
                .userName("tenant")
                .email("tenant@test.local")
                .password("secret")
                .build());

        Tenant tenant = tenantRepository.save(
                Tenant.builder().user(tenantUser).owner(ownerUser).build());

        BoardingHouse boardingHouse = new BoardingHouse();
        boardingHouse.setName("BH");
        boardingHouse.setAddress("ADDR");
        boardingHouse.setContactPhone("0123456789");
        boardingHouse.setOwner(ownerUser);
        boardingHouse = boardingHouseRepository.save(boardingHouse);

        Building building = new Building();
        building.setName("B1");
        building.setBoardingHouse(boardingHouse);
        building = buildingRepository.save(building);

        Room room = roomRepository.save(Room.builder()
                .roomNumber("101")
                .price(new BigDecimal("1000000"))
                .boardingHouse(boardingHouse)
                .building(building)
                .status(RoomStatus.OCCUPIED)
                .build());

        contract = contractRepository.save(Contract.builder()
                .contractCode("CT-001")
                .room(room)
                .tenant(tenant)
                .startDate(LocalDate.now().minusDays(10))
                .autoRenew(false)
                .rentPrice(new BigDecimal("1000000"))
                .status(ContractStatus.ACTIVE)
                .build());

        bill = billRepository.save(Bill.builder()
                .billTitle("Bill March")
                .billCode("BILL-001")
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
                .externalReference("PAY-001")
                .status(PaymentStatus.PENDING)
                .build());

        when(billingDiscrepancyAlertService.thresholdOrZero()).thenReturn(BigDecimal.ZERO);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void concurrentManualAllocate_shouldNotOverAllocate() throws Exception {
        PaymentAllocateRequest request = PaymentAllocateRequest.builder()
                .allocations(List.of(PaymentAllocationItemRequest.builder()
                        .billId(bill.getId())
                        .amount(new BigDecimal("800000"))
                        .build()))
                .note("test")
                .build();

        TransactionTemplate txTemplate = new TransactionTemplate(transactionManager);
        txTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);

        CountDownLatch readyLatch = new CountDownLatch(2);
        CountDownLatch startLatch = new CountDownLatch(1);

        Callable<Boolean> task = () -> {
            try {
                return txTemplate.execute(status -> {
                    authenticateOwner(ownerUser);
                    try {
                        readyLatch.countDown();
                        startLatch.await(5, TimeUnit.SECONDS);
                        paymentAllocationService.allocatePayment(payment.getId(), request);
                        return Boolean.TRUE;
                    } catch (AppException ex) {
                        // Trường hợp hợp lệ: request thứ 2 bị từ chối do outstanding không đủ.
                        return Boolean.FALSE;
                    } catch (InterruptedException ex) {
                        Thread.currentThread().interrupt();
                        return Boolean.FALSE;
                    } finally {
                        SecurityContextHolder.clearContext();
                    }
                });
            } catch (UnexpectedRollbackException ex) {
                // Giao dịch đã bị đánh dấu rollback-only bởi luồng thất bại.
                return Boolean.FALSE;
            }
        };

        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            Future<Boolean> f1 = executor.submit(task);
            Future<Boolean> f2 = executor.submit(task);

            assertTrue(readyLatch.await(5, TimeUnit.SECONDS));
            startLatch.countDown();

            boolean r1 = f1.get(10, TimeUnit.SECONDS);
            boolean r2 = f2.get(10, TimeUnit.SECONDS);

            int successCount = (r1 ? 1 : 0) + (r2 ? 1 : 0);
            assertEquals(1, successCount, "Chỉ một request được phép allocate thành công");

            BigDecimal allocated = paymentAllocationRepository.sumAllocatedByBillId(bill.getId());
            assertNotNull(allocated);
            assertTrue(allocated.compareTo(payment.getAmount()) <= 0, "Không được vượt quá số tiền payment");
        } finally {
            executor.shutdownNow();
        }
    }

    private void authenticateOwner(User owner) {
        // Dùng owner để pass validateContractAccess (không cần quyền admin).
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(owner, null, owner.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}
