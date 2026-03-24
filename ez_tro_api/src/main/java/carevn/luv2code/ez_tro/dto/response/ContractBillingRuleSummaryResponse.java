package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

import carevn.luv2code.ez_tro.enums.BillingCycle;
import carevn.luv2code.ez_tro.enums.ServiceType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractBillingRuleSummaryResponse {
    Integer id;
    Integer utilityId;
    String utilityName;
    BillingCycle cycle;
    BigDecimal unitPrice;
    ServiceType calculationType;
    LocalDate effectiveFrom;
    LocalDate effectiveTo;
    Boolean active;
    String note;
}
