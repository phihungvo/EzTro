package carevn.luv2code.ez_tro.dto.requests;

import java.math.BigDecimal;
import java.util.Date;

import carevn.luv2code.ez_tro.enums.ContractStatus;
import carevn.luv2code.ez_tro.enums.PaymentMethod;
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
public class ContractRequest {
    @NotNull(message = "roomId is required")
    Integer roomId;

    @NotNull(message = "tenantId is required")
    Integer tenantId;

    @NotNull(message = "startDate is required")
    Date startDate;

    Date endDate;

    BigDecimal deposit;

    @DecimalMin(value = "0.01", message = "Rent price must be greater than 0")
    BigDecimal rentPrice;

    ContractStatus status;

    String note;

    Date depositReceivedAt;

    PaymentMethod depositPaymentMethod;

    @Min(value = 1, message = "Payment cycle months must be >= 1")
    Integer paymentCycleMonths;

    @Min(value = 1, message = "Monthly payment day must be between 1 and 28")
    @Max(value = 28, message = "Monthly payment day must be between 1 and 28")
    Integer monthlyPaymentDay;
}
