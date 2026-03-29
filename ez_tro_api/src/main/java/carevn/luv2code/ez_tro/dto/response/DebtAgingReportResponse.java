package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DebtAgingReportResponse {
    Integer contractId;
    LocalDate reportDate;
    BigDecimal totalOutstanding;
    List<DebtAgingBucketResponse> buckets;
    List<DebtAgingInvoiceResponse> invoices;
}
