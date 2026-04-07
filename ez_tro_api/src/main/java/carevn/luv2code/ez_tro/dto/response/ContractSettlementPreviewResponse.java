package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractSettlementPreviewResponse {
    Integer openBillCount;
    BigDecimal paidBillsTotal;
    BigDecimal unpaidBillsTotal;
    BigDecimal depositBalance;
    BigDecimal estimatedRefundAmount;
    BigDecimal estimatedAdditionalCharge;
}
