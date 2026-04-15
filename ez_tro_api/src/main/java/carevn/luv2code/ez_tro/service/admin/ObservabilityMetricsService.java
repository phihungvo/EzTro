package carevn.luv2code.ez_tro.service.admin;

import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.enums.InvoiceType;

public interface ObservabilityMetricsService {
    void incrementContractCreated(Contract contract);

    void incrementContractVersionChanged(Contract contract, String source);

    void incrementAmendmentCreated(Contract contract, String amendmentType);

    void incrementInvoiceGenerated(Contract contract, InvoiceType invoiceType, String mode);

    void incrementBillingFailure(Contract contract, String stage, String reason);

    void incrementPaymentAllocationFailure(Contract contract, String operation, String reason);

    void incrementSettlementMismatch(Contract contract, String reason);

    void recordJobExecution(String jobName, String status, int processedCount);
}
