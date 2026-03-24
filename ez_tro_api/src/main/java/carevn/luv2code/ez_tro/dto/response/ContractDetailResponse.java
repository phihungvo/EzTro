package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;

import carevn.luv2code.ez_tro.enums.ContractLifecycleState;
import carevn.luv2code.ez_tro.enums.ContractStatus;
import carevn.luv2code.ez_tro.enums.PaymentMethod;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractDetailResponse {
    Integer id;

    String contractCode;

    Integer roomId;
    String roomNumber;

    Integer boardingHouseId;
    String boardingHouseName;
    Integer organizationId;
    String organizationName;

    Integer tenantId;
    Integer userId;
    String tenantFullName;
    String tenantPhoneNumber;
    String tenantEmail;
    String tenantIdentityNumber;
    Date tenantDateOfBirth;
    String tenantOccupation;
    String tenantNote;

    LocalDate startDate;
    LocalDate endDate;
    Boolean autoRenew;

    BigDecimal deposit;
    BigDecimal rentPrice;

    ContractStatus status;
    String note;

    Date depositReceivedAt;
    PaymentMethod depositPaymentMethod;
    Integer paymentCycleMonths;
    Integer monthlyPaymentDay;

    Integer fileCount;
    Date createdAt;
    Date updatedAt;

    List<ContractUtilityDetailResponse> utilities;
    List<ContractVersionSummaryResponse> versions;
    List<ContractAmendmentSummaryResponse> amendments;
    List<ContractBillingRuleSummaryResponse> billingRules;
    List<DepositTransactionSummaryResponse> depositTransactions;
    DepositLedgerSummaryResponse depositSummary;
    ContractSettlementPreviewResponse settlementPreview;
    ContractLifecycleState latestLifecycleState;
    List<ContractStateTransitionResponse> stateTransitions;
}
