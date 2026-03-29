package carevn.luv2code.ez_tro.service.admin.billing.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import carevn.luv2code.ez_tro.dto.response.ContractBillingRuleSummaryResponse;
import carevn.luv2code.ez_tro.dto.response.ContractSnapshotResponse;
import carevn.luv2code.ez_tro.dto.response.ContractVersionSummaryResponse;
import carevn.luv2code.ez_tro.entity.BillLine;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.MeterReading;
import carevn.luv2code.ez_tro.entity.Room;
import carevn.luv2code.ez_tro.enums.BillLineType;
import carevn.luv2code.ez_tro.enums.BillingCycle;
import carevn.luv2code.ez_tro.enums.InvoiceType;
import carevn.luv2code.ez_tro.enums.ServiceType;
import carevn.luv2code.ez_tro.repository.ContractVersionRepository;
import carevn.luv2code.ez_tro.repository.MeterReadingRepository;
import carevn.luv2code.ez_tro.service.admin.billing.InvoiceLineBuildResult;

@ExtendWith(MockitoExtension.class)
class DefaultInvoiceLineBuilderTest {

    @Mock
    private MeterReadingRepository meterReadingRepository;

    @Mock
    private ContractVersionRepository contractVersionRepository;

    @InjectMocks
    private DefaultInvoiceLineBuilder invoiceLineBuilder;

    @Test
    void buildLines_shouldApplyConfiguredQuantityForPerPersonAndPerVehicleRules() {
        Contract contract = Contract.builder()
                .id(1)
                .startDate(LocalDate.of(2026, 3, 1))
                .endDate(LocalDate.of(2026, 3, 31))
                .rentPrice(BigDecimal.ZERO)
                .build();
        ContractSnapshotResponse snapshot = ContractSnapshotResponse.builder()
                .currentVersion(ContractVersionSummaryResponse.builder()
                        .price(BigDecimal.ZERO)
                        .billingCycle(BillingCycle.MONTHLY)
                        .build())
                .activeBillingRules(List.of(
                        ContractBillingRuleSummaryResponse.builder()
                                .id(101)
                                .utilityId(11)
                                .utilityName("Wifi theo người")
                                .quantity(3)
                                .unitPrice(new BigDecimal("100000"))
                                .cycle(BillingCycle.MONTHLY)
                                .calculationType(ServiceType.PER_PERSON)
                                .build(),
                        ContractBillingRuleSummaryResponse.builder()
                                .id(102)
                                .utilityId(12)
                                .utilityName("Phí giữ xe")
                                .quantity(2)
                                .unitPrice(new BigDecimal("50000"))
                                .cycle(BillingCycle.MONTHLY)
                                .calculationType(ServiceType.PER_VEHICLE)
                                .build()))
                .build();

        when(contractVersionRepository.findOverlappingVersions(any(), any(), any()))
                .thenReturn(List.of());

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
    void buildLines_shouldUseReadingTimelineForMeteredUtilityAcrossMonthBoundary() {
        Contract contract = Contract.builder()
                .id(2)
                .room(Room.builder().id(20).build())
                .startDate(LocalDate.of(2026, 3, 15))
                .endDate(LocalDate.of(2026, 4, 14))
                .rentPrice(BigDecimal.ZERO)
                .build();
        ContractSnapshotResponse snapshot = ContractSnapshotResponse.builder()
                .currentVersion(ContractVersionSummaryResponse.builder()
                        .price(BigDecimal.ZERO)
                        .billingCycle(BillingCycle.MONTHLY)
                        .build())
                .activeBillingRules(List.of(ContractBillingRuleSummaryResponse.builder()
                        .id(201)
                        .utilityId(21)
                        .utilityName("Điện")
                        .unitPrice(new BigDecimal("3000"))
                        .cycle(BillingCycle.MONTHLY)
                        .calculationType(ServiceType.USAGE_BASED)
                        .build()))
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
        return java.util.Date.from(date.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }
}
