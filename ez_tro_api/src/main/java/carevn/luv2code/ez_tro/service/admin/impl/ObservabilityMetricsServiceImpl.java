package carevn.luv2code.ez_tro.service.admin.impl;

import org.springframework.stereotype.Service;

import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.Organization;
import carevn.luv2code.ez_tro.enums.InvoiceType;
import carevn.luv2code.ez_tro.service.admin.ObservabilityMetricsService;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.DistributionSummary;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ObservabilityMetricsServiceImpl implements ObservabilityMetricsService {

    private static final String UNKNOWN = "unknown";

    private final MeterRegistry meterRegistry;

    @Override
    public void incrementContractCreated(Contract contract) {
        counter("ez_tro_contract_created_total", contract, "source", "api").increment();
    }

    @Override
    public void incrementContractVersionChanged(Contract contract, String source) {
        counter("ez_tro_contract_version_change_total", contract, "source", safeTag(source))
                .increment();
    }

    @Override
    public void incrementAmendmentCreated(Contract contract, String amendmentType) {
        counter("ez_tro_contract_amendment_total", contract, "amendment_type", safeTag(amendmentType))
                .increment();
    }

    @Override
    public void incrementInvoiceGenerated(Contract contract, InvoiceType invoiceType, String mode) {
        counter(
                        "ez_tro_billing_invoice_generated_total",
                        contract,
                        "invoice_type",
                        invoiceType == null ? UNKNOWN : invoiceType.name().toLowerCase(),
                        "mode",
                        safeTag(mode))
                .increment();
    }

    @Override
    public void incrementBillingFailure(Contract contract, String stage, String reason) {
        counter("ez_tro_billing_failure_total", contract, "stage", safeTag(stage), "reason", safeTag(reason))
                .increment();
    }

    @Override
    public void incrementPaymentAllocationFailure(Contract contract, String operation, String reason) {
        counter(
                        "ez_tro_payment_allocation_failure_total",
                        contract,
                        "operation",
                        safeTag(operation),
                        "reason",
                        safeTag(reason))
                .increment();
    }

    @Override
    public void incrementSettlementMismatch(Contract contract, String reason) {
        counter("ez_tro_settlement_mismatch_total", contract, "reason", safeTag(reason))
                .increment();
    }

    @Override
    public void recordJobExecution(String jobName, String status, int processedCount) {
        Counter.builder("ez_tro_job_execution_total")
                .tag("job_name", safeTag(jobName))
                .tag("status", safeTag(status))
                .register(meterRegistry)
                .increment();
        DistributionSummary.builder("ez_tro_job_processed_records")
                .baseUnit("records")
                .tag("job_name", safeTag(jobName))
                .tag("status", safeTag(status))
                .register(meterRegistry)
                .record(Math.max(0, processedCount));
    }

    private Counter counter(String name, Contract contract, String... extraTags) {
        Counter.Builder builder = Counter.builder(name)
                .tag("organization_id", resolveOrganizationId(contract))
                .tag("contract_id", resolveContractId(contract));
        for (int i = 0; i + 1 < extraTags.length; i += 2) {
            builder.tag(extraTags[i], safeTag(extraTags[i + 1]));
        }
        return builder.register(meterRegistry);
    }

    private String resolveOrganizationId(Contract contract) {
        Organization organization = contract != null ? contract.getOrganization() : null;
        return organization != null && organization.getId() != null
                ? organization.getId().toString()
                : UNKNOWN;
    }

    private String resolveContractId(Contract contract) {
        return contract != null && contract.getId() != null ? contract.getId().toString() : UNKNOWN;
    }

    private String safeTag(String value) {
        if (value == null || value.isBlank()) {
            return UNKNOWN;
        }
        return value.trim().toLowerCase().replace(' ', '_');
    }
}
