package carevn.luv2code.ez_tro.service.admin.billing;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import carevn.luv2code.ez_tro.dto.requests.InvoicePreviewRequest;
import carevn.luv2code.ez_tro.dto.response.ContractSnapshotResponse;
import carevn.luv2code.ez_tro.dto.response.ContractVersionSummaryResponse;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.enums.BillingCycle;
import carevn.luv2code.ez_tro.enums.InvoiceType;
import carevn.luv2code.ez_tro.repository.ContractVersionRepository;
import carevn.luv2code.ez_tro.repository.MeterReadingRepository;
import carevn.luv2code.ez_tro.service.admin.billing.impl.DefaultInvoiceLineBuilder;

@ExtendWith(MockitoExtension.class)
class DefaultInvoiceLineBuilderTest {

    @Mock
    MeterReadingRepository meterReadingRepository;

    @Mock
    ContractVersionRepository contractVersionRepository;

    @InjectMocks
    DefaultInvoiceLineBuilder builder;

    @Test
    void prorateRent_whenJoinMidMonth_shouldUseActualDays() {
        // Month April 2026 has 30 days; tenant joins on 10th, end open
        Contract contract = Contract.builder()
                .id(1)
                .startDate(LocalDate.of(2026, 4, 10))
                .endDate(LocalDate.of(2026, 12, 31))
                .rentPrice(new BigDecimal("3000000"))
                .build();

        ContractVersionSummaryResponse version = ContractVersionSummaryResponse.builder()
                .price(new BigDecimal("3000000"))
                .billingCycle(BillingCycle.MONTHLY)
                .build();

        ContractSnapshotResponse snapshot = ContractSnapshotResponse.builder()
                .currentVersion(version)
                .activeBillingRules(List.of())
                .build();

        when(contractVersionRepository.findOverlappingVersions(
                        contract.getId(), LocalDate.of(2026, 4, 10), LocalDate.of(2026, 4, 30)))
                .thenReturn(List.of());

        InvoicePreviewRequest req = InvoicePreviewRequest.builder()
                .contractId(contract.getId())
                .invoiceType(InvoiceType.RENT)
                .build();

        var result = builder.buildLines(
                contract, snapshot, LocalDate.of(2026, 4, 1), LocalDate.of(2026, 4, 30), InvoiceType.RENT, req);

        // expected: 21 days of 30 -> 2.1m
        assertThat(result.getRentAmount()).isEqualByComparingTo(new BigDecimal("2100000.00"));
        assertThat(result.getLines()).anyMatch(l -> l.getLineType().name().equals("RENT"));
    }
}
