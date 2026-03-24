package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;

import carevn.luv2code.ez_tro.enums.BillingCycle;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractVersionSummaryResponse {
    Integer id;
    Integer versionNumber;
    BigDecimal price;
    BigDecimal depositAmount;
    BillingCycle billingCycle;
    Integer paymentCycleMonths;
    Integer monthlyPaymentDay;
    LocalDate effectiveFrom;
    LocalDate effectiveTo;
    String note;
    Integer createdBy;
    Date createdAt;
}
