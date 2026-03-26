package carevn.luv2code.ez_tro.service.admin.billing;

import java.time.LocalDate;

import carevn.luv2code.ez_tro.dto.requests.InvoicePreviewRequest;
import carevn.luv2code.ez_tro.dto.response.ContractSnapshotResponse;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.enums.InvoiceType;

/**
 * Builder dựng danh sách {@code BillLine} cho một invoice/bill theo hợp đồng và kỳ tính.
 */
public interface InvoiceLineBuilder {
    InvoiceLineBuildResult buildLines(
            Contract contract,
            ContractSnapshotResponse snapshot,
            LocalDate billingPeriodStart,
            LocalDate billingPeriodEnd,
            InvoiceType invoiceType,
            InvoicePreviewRequest request);
}
