package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.util.List;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReconciliationReportResponse {
    Integer contractId;
    BigDecimal invoiceTotal;
    BigDecimal paymentTotal;
    BigDecimal allocationTotal;
    BigDecimal outstandingTotal;
    BigDecimal creditTotal;
    List<InvoiceBalanceResponse> invoices;
    BigDecimal discrepancyPercent;
    Boolean discrepancyAlert;
}
