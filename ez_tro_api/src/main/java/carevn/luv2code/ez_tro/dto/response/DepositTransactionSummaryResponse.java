package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.util.Date;

import carevn.luv2code.ez_tro.enums.DepositReferenceType;
import carevn.luv2code.ez_tro.enums.DepositTransactionType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepositTransactionSummaryResponse {
    Integer id;
    DepositTransactionType transactionType;
    BigDecimal amount;
    String currency;
    DepositReferenceType referenceType;
    String referenceId;
    String note;
    Integer createdBy;
    String createdByName;
    Date occurredAt;
    Date createdAt;
}
