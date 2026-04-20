package carevn.luv2code.ez_tro.dto.response;

import java.time.LocalDate;
import java.util.List;

import carevn.luv2code.ez_tro.enums.ContractStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractSnapshotResponse {
    Integer contractId;
    String contractCode;
    Integer organizationId;
    Integer roomId;
    Integer tenantId;
    ContractStatus contractStatus;
    LocalDate contractStartDate;
    LocalDate contractEndDate;
    LocalDate asOfDate;
    ContractVersionSummaryResponse currentVersion;
    List<ContractAmendmentSummaryResponse> activeAmendments;
    List<ContractBillingRuleSummaryResponse> activeBillingRules;
}
