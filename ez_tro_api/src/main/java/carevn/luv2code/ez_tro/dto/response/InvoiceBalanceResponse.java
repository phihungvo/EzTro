package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

import carevn.luv2code.ez_tro.enums.BillStatus;
import carevn.luv2code.ez_tro.enums.InvoicePaymentStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceBalanceResponse {
    Integer billId;
    Integer contractId;
    String generationKey;
    LocalDate billingPeriodStart;
    LocalDate billingPeriodEnd;
    LocalDate dueDate;
    BigDecimal invoiceTotal;
    BigDecimal allocatedAmount;
    BigDecimal outstandingAmount;
    BigDecimal overpaidAmount;
    InvoicePaymentStatus paymentStatus;
    BillStatus billStatus;
}
