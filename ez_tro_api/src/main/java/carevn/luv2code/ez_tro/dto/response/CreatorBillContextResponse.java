package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.util.List;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatorBillContextResponse {

    private Integer roomId;
    private String roomNumber;

    private Integer contractId;
    private BigDecimal rentPrice;

    private List<CreatorBillUtilityItemResponse> usageBasedUtilities;
    private List<CreatorBillUtilityItemResponse> fixedChargeUtilities;
    private List<CreatorBillMeterItemResponse> meterReadings;

    private Boolean hasBillThisMonth;

    private ContractSnapshotResponse contractSnapshot;
    private List<ContractBillingRuleSummaryResponse> billingRules;
    private DepositLedgerSummaryResponse depositSummary;
    private List<DepositTransactionSummaryResponse> depositTransactions;
}
