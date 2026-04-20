package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DebtAgingInvoiceResponse {
    Integer billId;
    String billCode;
    String billTitle;
    LocalDate dueDate;
    Integer ageDays;
    String bucketCode;
    BigDecimal outstandingAmount;
}
