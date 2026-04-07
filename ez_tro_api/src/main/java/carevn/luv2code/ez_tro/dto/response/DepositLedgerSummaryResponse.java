package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepositLedgerSummaryResponse {
    BigDecimal totalCollected;
    BigDecimal totalDeducted;
    BigDecimal totalRefunded;
    BigDecimal currentBalance;
}
