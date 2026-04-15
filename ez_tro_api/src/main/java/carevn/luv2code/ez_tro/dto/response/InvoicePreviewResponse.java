package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import carevn.luv2code.ez_tro.enums.InvoiceType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoicePreviewResponse {
    Integer contractId;
    Integer organizationId;
    InvoiceType invoiceType;
    LocalDate billingPeriodStart;
    LocalDate billingPeriodEnd;
    LocalDate dueDate;
    String generationKey;
    BigDecimal totalAmount;
    BigDecimal rentAmount;
    BigDecimal serviceAmount;
    BigDecimal discountAmount;
    BigDecimal penaltyAmount;
    boolean hasMissingMeterReadings;
    List<InvoiceLinePreviewResponse> lines;
}
