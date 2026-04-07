package carevn.luv2code.ez_tro.dto.requests;

import java.math.BigDecimal;
import java.util.Date;

import carevn.luv2code.ez_tro.enums.DepositReferenceType;
import carevn.luv2code.ez_tro.enums.DepositTransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepositTransactionCreateRequest {

    @NotNull
    private DepositTransactionType transactionType;

    @NotNull
    @DecimalMin(value = "0.01", inclusive = true)
    private BigDecimal amount;

    private String currency;

    private DepositReferenceType referenceType;

    private String referenceId;

    private String note;

    private Date occurredAt;
}
