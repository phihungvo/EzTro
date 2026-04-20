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
public class ContractRoomTransferRequest {
    @NotNull
    private Integer targetRoomId;

    @NotNull
    private LocalDate transferDate;

    private Boolean transferDeposit;

    @DecimalMin(value = "0.00", inclusive = true)
    private BigDecimal newRentPrice;

    @DecimalMin(value = "0.00", inclusive = true)
    private BigDecimal newDepositAmount;

    private String note;
}
