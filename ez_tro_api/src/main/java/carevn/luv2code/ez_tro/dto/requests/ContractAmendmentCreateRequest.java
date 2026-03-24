package carevn.luv2code.ez_tro.dto.requests;

import java.math.BigDecimal;
import java.time.LocalDate;

import carevn.luv2code.ez_tro.enums.ContractAmendmentType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractAmendmentCreateRequest {

    @NotNull
    private ContractAmendmentType amendmentType;

    @NotNull
    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;

    @DecimalMin(value = "0.00", inclusive = true)
    private BigDecimal price;

    @DecimalMin(value = "0.00", inclusive = true)
    private BigDecimal depositAmount;

    @Min(1)
    private Integer paymentCycleMonths;

    @Min(1)
    @Max(28)
    private Integer monthlyPaymentDay;

    private String dataJson;

    private String note;
}
