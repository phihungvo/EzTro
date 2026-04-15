package carevn.luv2code.ez_tro.dto.requests;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractRenewRequest {
    @NotNull
    private LocalDate effectiveFrom;

    @NotNull
    private LocalDate newEndDate;

    @DecimalMin(value = "0.01", message = "Rent price must be greater than 0")
    private BigDecimal newRentPrice;

    @DecimalMin(value = "0.00", inclusive = true)
    private BigDecimal newDepositAmount;

    private Integer paymentCycleMonths;

    private Integer monthlyPaymentDay;

    private Boolean autoRenew;

    private String note;
}
