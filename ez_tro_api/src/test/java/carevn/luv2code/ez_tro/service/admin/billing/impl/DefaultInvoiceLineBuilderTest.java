package carevn.luv2code.ez_tro.service.admin.billing.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import carevn.luv2code.ez_tro.dto.response.ContractSnapshotResponse;
import carevn.luv2code.ez_tro.dto.response.ContractVersionSummaryResponse;
import carevn.luv2code.ez_tro.entity.BillLine;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.MeterReading;
import carevn.luv2code.ez_tro.entity.Room;
import carevn.luv2code.ez_tro.entity.RoomUtility;
import carevn.luv2code.ez_tro.entity.RoomUtilityId;
import carevn.luv2code.ez_tro.entity.Utility;
import carevn.luv2code.ez_tro.enums.BillLineType;
import carevn.luv2code.ez_tro.enums.BillingCycle;
import carevn.luv2code.ez_tro.enums.InvoiceType;
import carevn.luv2code.ez_tro.enums.ServiceType;
import carevn.luv2code.ez_tro.repository.ContractVersionRepository;
import carevn.luv2code.ez_tro.repository.MeterReadingRepository;
import carevn.luv2code.ez_tro.repository.RoomUtilityRepository;
import carevn.luv2code.ez_tro.service.admin.billing.InvoiceLineBuildResult;

@ExtendWith(MockitoExtension.class)
class DefaultInvoiceLineBuilderTest {

    @Mock
    private MeterReadingRepository meterReadingRepository;

    @Mock
    private ContractVersionRepository contractVersionRepository;

    @Mock
    private RoomUtilityRepository roomUtilityRepository;

    @InjectMocks
    private DefaultInvoiceLineBuilder invoiceLineBuilder;

    @Test
    void buildLines_shouldApplyConfiguredQuantityForPerPersonAndPerVehicleRules() {
        Contract contract = Contract.builder()
                .id(1)
                .room(Room.builder().id(10).build())
                .startDate(LocalDate.of(2026, 3, 1))
                .endDate(LocalDate.of(2026, 3, 31))
                .rentPrice(BigDecimal.ZERO)
                .build();
        Utility wifi = Utility.builder()
                .id(11)
                .name("Wifi theo người")
                .unitPrice(new BigDecimal("100000"))
                .type(ServiceType.PER_PERSON)
                .isActive(true)
                .build();
        Utility parking = Utility.builder()
                .id(12)
                .name("Phí giữ xe")
                .unitPrice(new BigDecimal("50000"))
                .type(ServiceType.PER_VEHICLE)
                .isActive(true)
                .build();
        RoomUtility wifiRoomUtility = RoomUtility.builder()
                .id(new RoomUtilityId(10, 11))
                .room(contract.getRoom())
                .utility(wifi)
                .quantity(3)
                .startDate(LocalDate.of(2026, 3, 1))
                .build();
        RoomUtility parkingRoomUtility = RoomUtility.builder()
                .id(new RoomUtilityId(10, 12))
                .room(contract.getRoom())
                .utility(parking)
                .quantity(2)
                .startDate(LocalDate.of(2026, 3, 1))
                .build();
        ContractSnapshotResponse snapshot = ContractSnapshotResponse.builder()
                .currentVersion(ContractVersionSummaryResponse.builder()
                        .price(BigDecimal.ZERO)
                        .billingCycle(BillingCycle.MONTHLY)
                        .build())
                .activeBillingRules(List.of())
                .build();

        when(contractVersionRepository.findOverlappingVersions(any(), any(), any()))
                .thenReturn(List.of());
        when(roomUtilityRepository.findByRoomId(10)).thenReturn(List.of(wifiRoomUtility, parkingRoomUtility));

        InvoiceLineBuildResult result = invoiceLineBuilder.buildLines(
                contract, snapshot, LocalDate.of(2026, 3, 1), LocalDate.of(2026, 3, 31), InvoiceType.RENT, null);

        List<BillLine> serviceLines = result.getLines().stream()
                .filter(line -> line.getLineType() == BillLineType.SERVICE)
                .toList();

        assertEquals(2, serviceLines.size());
        assertTrue(serviceLines.stream()
                .anyMatch(line -> line.getUtilityId().equals(11)
                        && new BigDecimal("3").compareTo(line.getQuantity()) == 0
                        && new BigDecimal("300000.00").compareTo(line.getAmount()) == 0));
        assertTrue(serviceLines.stream()
                .anyMatch(line -> line.getUtilityId().equals(12)
                        && new BigDecimal("2").compareTo(line.getQuantity()) == 0
                        && new BigDecimal("100000.00").compareTo(line.getAmount()) == 0));
        assertEquals(0, new BigDecimal("400000.00").compareTo(result.getServiceAmount()));
    }

    @Test
    void buildLines_shouldRespectExplicitFixedServiceSelection() {
        Contract contract = Contract.builder()
                .id(3)
                .room(Room.builder().id(30).build())
                .startDate(LocalDate.of(2026, 5, 1))
                .endDate(LocalDate.of(2026, 5, 31))
                .rentPrice(BigDecimal.ZERO)
                .build();
        Utility wifi = Utility.builder()
                .id(31)
                .name("Wifi")
                .unitPrice(new BigDecimal("150000"))
                .type(ServiceType.FIXED)
                .isActive(true)
                .build();
        Utility parking = Utility.builder()
                .id(32)
                .name("Giữ xe")
                .unitPrice(new BigDecimal("60000"))
                .type(ServiceType.FIXED)
                .isActive(true)
                .build();
        RoomUtility wifiRoomUtility = RoomUtility.builder()
                .id(new RoomUtilityId(30, 31))
                .room(contract.getRoom())
                .utility(wifi)
                .quantity(1)
                .startDate(LocalDate.of(2026, 5, 1))
                .build();
        RoomUtility parkingRoomUtility = RoomUtility.builder()
                .id(new RoomUtilityId(30, 32))
                .room(contract.getRoom())
                .utility(parking)
                .quantity(2)
                .startDate(LocalDate.of(2026, 5, 1))
                .build();
        ContractSnapshotResponse snapshot = ContractSnapshotResponse.builder()
                .currentVersion(ContractVersionSummaryResponse.builder()
                        .price(BigDecimal.ZERO)
                        .billingCycle(BillingCycle.MONTHLY)
                        .build())
                .activeBillingRules(List.of())
                .build();

        when(contractVersionRepository.findOverlappingVersions(any(), any(), any()))
                .thenReturn(List.of());
        when(roomUtilityRepository.findByRoomId(30)).thenReturn(List.of(wifiRoomUtility, parkingRoomUtility));

        InvoiceLineBuildResult result = invoiceLineBuilder.buildLines(
                contract,
                snapshot,
                LocalDate.of(2026, 5, 1),
                LocalDate.of(2026, 5, 31),
                InvoiceType.RENT,
                carevn.luv2code.ez_tro.dto.requests.InvoicePreviewRequest.builder()
                        .contractId(contract.getId())
                        .fixedServices(List.of(carevn.luv2code.ez_tro.dto.requests.InvoiceServiceRequest.builder()
                                .utilityId(31)
                                .utilityName("Wifi")
                                .type("FIXED")
                                .unitPrice(new BigDecimal("150000"))
                                .quantity(1)
                                .checked(true)
                                .build()))
                        .build());

        List<BillLine> serviceLines = result.getLines().stream()
                .filter(line -> line.getLineType() == BillLineType.SERVICE)
                .toList();

        assertEquals(1, serviceLines.size());
        assertTrue(serviceLines.stream().anyMatch(line -> line.getUtilityId().equals(31)));
        assertEquals(0, new BigDecimal("150000.00").compareTo(result.getServiceAmount()));
    }

    @Test
    void buildLines_shouldUseReadingTimelineForMeteredUtilityAcrossMonthBoundary() {
        Contract contract = Contract.builder()
                .id(2)
                .room(Room.builder().id(20).build())
                .startDate(LocalDate.of(2026, 3, 15))
                .endDate(LocalDate.of(2026, 4, 14))
                .rentPrice(BigDecimal.ZERO)
                .build();
        Utility elec = Utility.builder()
                .id(21)
                .name("Điện")
                .unitPrice(new BigDecimal("3000"))
                .type(ServiceType.USAGE_BASED)
                .isActive(true)
                .build();
        RoomUtility roomUtility = RoomUtility.builder()
                .id(new RoomUtilityId(20, 21))
                .room(contract.getRoom())
                .utility(elec)
                .quantity(1)
                .startDate(LocalDate.of(2026, 3, 1))
                .build();
        ContractSnapshotResponse snapshot = ContractSnapshotResponse.builder()
                .currentVersion(ContractVersionSummaryResponse.builder()
                        .price(BigDecimal.ZERO)
                        .billingCycle(BillingCycle.MONTHLY)
                        .build())
                .activeBillingRules(List.of())
                .build();

        MeterReading opening = MeterReading.builder()
                .id(1)
                .currentIndex(new BigDecimal("100"))
                .readingDate(toDate(LocalDate.of(2026, 3, 14)))
                .build();
        MeterReading closing = MeterReading.builder()
                .id(2)
                .previousIndex(new BigDecimal("100"))
                .currentIndex(new BigDecimal("160"))
                .unitPrice(new BigDecimal("3000"))
                .readingDate(toDate(LocalDate.of(2026, 4, 14)))
                .build();

        when(contractVersionRepository.findOverlappingVersions(any(), any(), any()))
                .thenReturn(List.of());
        when(roomUtilityRepository.findByRoomId(20)).thenReturn(List.of(roomUtility));
        when(meterReadingRepository.findTopByRoomIdAndUtilityIdAndReadingDateBeforeOrderByReadingDateDescIdDesc(
                        20, 21, toDate(LocalDate.of(2026, 3, 15))))
                .thenReturn(java.util.Optional.of(opening));
        when(meterReadingRepository.findTopByRoomIdAndUtilityIdAndReadingDateLessThanEqualOrderByReadingDateDescIdDesc(
                        20, 21, toDate(LocalDate.of(2026, 4, 14))))
                .thenReturn(java.util.Optional.of(closing));

        InvoiceLineBuildResult result = invoiceLineBuilder.buildLines(
                contract, snapshot, LocalDate.of(2026, 3, 15), LocalDate.of(2026, 4, 14), InvoiceType.RENT, null);

        BillLine utilityLine = result.getLines().stream()
                .filter(line -> line.getLineType() == BillLineType.UTILITY_METERED)
                .findFirst()
                .orElseThrow();

        assertEquals(0, new BigDecimal("60").compareTo(utilityLine.getQuantity()));
        assertEquals(0, new BigDecimal("180000.00").compareTo(utilityLine.getAmount()));
        assertTrue(utilityLine.getMetadataJson().contains("reading_date_range"));
    }

    private java.util.Date toDate(LocalDate date) {
        return java.sql.Date.valueOf(date);
    }
}
