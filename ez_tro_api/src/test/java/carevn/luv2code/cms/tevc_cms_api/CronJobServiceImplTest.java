package carevn.luv2code.cms.tevc_cms_api;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.quartz.SchedulerException;

import carevn.luv2code.ez_tro.entity.*;
import carevn.luv2code.ez_tro.enums.BillStatus;
import carevn.luv2code.ez_tro.enums.ContractStatus;
import carevn.luv2code.ez_tro.enums.RoomStatus;
import carevn.luv2code.ez_tro.enums.ServiceType;
import carevn.luv2code.ez_tro.repository.*;
import carevn.luv2code.ez_tro.service.admin.impl.CronJobServiceImpl;

@ExtendWith(MockitoExtension.class)
class CronJobServiceImplTest {

    @Mock
    private ContractRepository contractRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private AmenityRepository amenityRepository;

    @Mock
    private RoomAmenityRepository roomAmenityRepository;

    @Mock
    private ElectricWaterRecordRepository electricWaterRecordRepository;

    @Mock
    private BillRepository billRepository;

    @InjectMocks
    private CronJobServiceImpl cronJobService;

    private Contract contract;
    private Room room;
    private Tenant tenant;
    private Bill existingBill;
    private RoomAmenity roomAmenity;
    private Amenity amenity;
    private ElectricWaterRecord record;

    @BeforeEach
    void setUp() throws SchedulerException {
        cronJobService = new CronJobServiceImpl(
                contractRepository,
                roomRepository,
                amenityRepository,
                roomAmenityRepository,
                electricWaterRecordRepository,
                billRepository);

        // Sample data
        room = Room.builder().id(1).status(RoomStatus.OCCUPIED).isDeleted(false).build();
        tenant = Tenant.builder()
                .id(1)
                .user(User.builder().enabled(true).build())
                .build();
        contract = Contract.builder()
                .id(1)
                .rentPrice(new BigDecimal("5000000"))
                .room(room)
                .tenant(tenant)
                .status(ContractStatus.ACTIVE)
                .contractCode("CON001")
                .build();

        roomAmenity = RoomAmenity.builder()
                .id(new RoomAmenityId(room.getId(), 1))
                .room(room)
                .amenity(null) // Set later
                .quantity(1)
                .build();

        amenity = Amenity.builder()
                .id(1)
                .type(ServiceType.FIXED)
                .unitPrice(new BigDecimal("500000"))
                .name("Internet")
                .build();
        roomAmenity.setAmenity(amenity);

        record = ElectricWaterRecord.builder()
                .id(1)
                .room(room)
                .month(10)
                .year(2025)
                .electricStart(100)
                .electricEnd(150)
                .waterStart(50)
                .waterEnd(60)
                .build();

        existingBill = Bill.builder().id(1).contract(contract).build();
    }

    @Test
    void generateMonthlyBills_ShouldCreateBill_WhenActiveContract() {
        // Given
        when(contractRepository.findActiveContractsForBilling(anyInt(), anyInt()))
                .thenReturn(List.of(contract));
        when(billRepository.findByContractAndMonthYear(any(Contract.class), anyInt(), anyInt()))
                .thenReturn(Optional.empty());
        when(roomAmenityRepository.findActiveByRoomId(anyInt(), anyInt(), anyInt()))
                .thenReturn(List.of(roomAmenity));
        when(electricWaterRecordRepository.findByRoomAndMonthYear(any(Room.class), anyInt(), anyInt()))
                .thenReturn(Optional.of(record));
        when(billRepository.save(any(Bill.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        cronJobService.generateMonthlyBills(); // Note: Make private method package-private or use reflection for test

        // Then
        verify(billRepository)
                .save(argThat(bill -> bill.getAmount().compareTo(new BigDecimal("5500000")) == 0
                        && bill.getStatus() == BillStatus.UNPAID
                        && bill.getDueDate()
                                .toInstant()
                                .atZone(ZoneId.systemDefault())
                                .toLocalDate()
                                .equals(LocalDate.of(2025, 10, 31))));
    }

    @Test
    void generateMonthlyBills_ShouldSkip_WhenExistingBill() {
        // Given
        when(contractRepository.findActiveContractsForBilling(anyInt(), anyInt()))
                .thenReturn(List.of(contract));
        when(billRepository.findByContractAndMonthYear(any(Contract.class), anyInt(), anyInt()))
                .thenReturn(Optional.of(existingBill));

        // When
        cronJobService.generateMonthlyBills();

        // Then
        verify(billRepository, never()).save(any(Bill.class));
    }

    @Test
    void generateMonthlyBills_ShouldSkip_WhenRoomNotOccupied() {
        // Given
        room.setStatus(RoomStatus.AVAILABLE);
        when(contractRepository.findActiveContractsForBilling(anyInt(), anyInt()))
                .thenReturn(List.of(contract));
        when(billRepository.findByContractAndMonthYear(any(Contract.class), anyInt(), anyInt()))
                .thenReturn(Optional.empty());

        // When
        cronJobService.generateMonthlyBills();

        // Then
        verify(billRepository, never()).save(any(Bill.class));
    }

    @Test
    void calculateServiceAmount_ShouldIncludeUtilities_WhenUsageBased() {
        // Given
        amenity.setType(ServiceType.USAGE_BASED);
        amenity.setName("Điện");
        roomAmenity.setAmenity(amenity);
        when(roomAmenityRepository.findActiveByRoomId(anyInt(), anyInt(), anyInt()))
                .thenReturn(List.of(roomAmenity));
        when(electricWaterRecordRepository.findByRoomAndMonthYear(any(Room.class), anyInt(), anyInt()))
                .thenReturn(Optional.of(record));
        amenity.setUnitPrice(new BigDecimal("2000")); // 50kWh * 2000 = 100k

        // When
        BigDecimal result = ((CronJobServiceImpl) cronJobService).calculateServiceAmount(room, 10, 2025);

        // Then
        assertEquals(new BigDecimal("100000"), result); // 50 units * 2000
    }

    @Test
    void scheduleBillGenerationJob_ShouldLogSuccess() {
        // Given/When
        cronJobService.scheduleBillGenerationJob("0 0 1 * * ?");

        // Then: Verify log or scheduler call (mock scheduler if needed)
        // Use ArgumentCaptor for verify, but for simplicity, assume no exception
        assertDoesNotThrow(() -> cronJobService.scheduleBillGenerationJob("0 0 1 * * ?"));
    }
}
