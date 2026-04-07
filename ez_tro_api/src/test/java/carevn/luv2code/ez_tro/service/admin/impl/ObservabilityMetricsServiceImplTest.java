package carevn.luv2code.ez_tro.service.admin.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.math.BigDecimal;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.Organization;
import carevn.luv2code.ez_tro.enums.InvoiceType;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;

class ObservabilityMetricsServiceImplTest {

    private SimpleMeterRegistry meterRegistry;
    private ObservabilityMetricsServiceImpl observabilityMetricsService;

    @BeforeEach
    void setUp() {
        meterRegistry = new SimpleMeterRegistry();
        observabilityMetricsService = new ObservabilityMetricsServiceImpl(meterRegistry);
    }

    @Test
    void shouldRecordBusinessCountersWithTags() {
        Contract contract = Contract.builder()
                .id(10)
                .organization(Organization.builder().id(7).build())
                .deposit(BigDecimal.ONE)
                .build();

        observabilityMetricsService.incrementContractCreated(contract);
        observabilityMetricsService.incrementContractVersionChanged(contract, "renew");
        observabilityMetricsService.incrementAmendmentCreated(contract, "RENT_CHANGE");
        observabilityMetricsService.incrementInvoiceGenerated(contract, InvoiceType.RENT, "create");
        observabilityMetricsService.incrementBillingFailure(contract, "generate", "duplicate_invoice");
        observabilityMetricsService.incrementPaymentAllocationFailure(contract, "allocate", "PAYMENT_INVALID_STATE");
        observabilityMetricsService.incrementSettlementMismatch(contract, "insufficient_deposit");

        assertEquals(
                1.0,
                meterRegistry
                        .get("ez_tro_contract_created_total")
                        .tag("organization_id", "7")
                        .tag("contract_id", "10")
                        .counter()
                        .count());
        assertEquals(
                1.0,
                meterRegistry
                        .get("ez_tro_contract_version_change_total")
                        .tag("source", "renew")
                        .counter()
                        .count());
        assertEquals(
                1.0,
                meterRegistry
                        .get("ez_tro_contract_amendment_total")
                        .tag("amendment_type", "rent_change")
                        .counter()
                        .count());
        assertEquals(
                1.0,
                meterRegistry
                        .get("ez_tro_billing_invoice_generated_total")
                        .tag("invoice_type", "rent")
                        .tag("mode", "create")
                        .counter()
                        .count());
        assertEquals(
                1.0,
                meterRegistry
                        .get("ez_tro_billing_failure_total")
                        .tag("stage", "generate")
                        .tag("reason", "duplicate_invoice")
                        .counter()
                        .count());
        assertEquals(
                1.0,
                meterRegistry
                        .get("ez_tro_payment_allocation_failure_total")
                        .tag("operation", "allocate")
                        .tag("reason", "payment_invalid_state")
                        .counter()
                        .count());
        assertEquals(
                1.0,
                meterRegistry
                        .get("ez_tro_settlement_mismatch_total")
                        .tag("reason", "insufficient_deposit")
                        .counter()
                        .count());
    }

    @Test
    void shouldRecordJobMetrics() {
        observabilityMetricsService.recordJobExecution("billing_monthly", "success", 9);

        assertEquals(
                1.0,
                meterRegistry
                        .get("ez_tro_job_execution_total")
                        .tag("job_name", "billing_monthly")
                        .tag("status", "success")
                        .counter()
                        .count());
        assertEquals(
                9.0,
                meterRegistry
                        .get("ez_tro_job_processed_records")
                        .tag("job_name", "billing_monthly")
                        .tag("status", "success")
                        .summary()
                        .totalAmount());
    }
}
