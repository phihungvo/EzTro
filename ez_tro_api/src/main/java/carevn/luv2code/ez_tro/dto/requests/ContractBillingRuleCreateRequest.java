package carevn.luv2code.ez_tro.dto.requests;

import java.math.BigDecimal;
import java.time.LocalDate;

import carevn.luv2code.ez_tro.enums.BillingCycle;
import carevn.luv2code.ez_tro.enums.ServiceType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractBillingRuleCreateRequest {

    @NotNull
    private Integer utilityId;

    @NotNull
    private BillingCycle cycle;

    @NotNull
    @DecimalMin(value = "0.00", inclusive = true)
    private BigDecimal unitPrice;

    @NotNull
    private ServiceType calculationType;

    @NotNull
    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;

    private String note;
}
