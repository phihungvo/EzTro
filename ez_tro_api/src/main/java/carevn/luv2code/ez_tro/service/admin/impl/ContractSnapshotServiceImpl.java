package carevn.luv2code.ez_tro.service.admin.impl;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.response.ContractAmendmentSummaryResponse;
import carevn.luv2code.ez_tro.dto.response.ContractBillingRuleSummaryResponse;
import carevn.luv2code.ez_tro.dto.response.ContractSnapshotResponse;
import carevn.luv2code.ez_tro.dto.response.ContractVersionSummaryResponse;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.ContractAmendment;
import carevn.luv2code.ez_tro.entity.ContractBillingRule;
import carevn.luv2code.ez_tro.entity.ContractVersion;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.repository.ContractAmendmentRepository;
import carevn.luv2code.ez_tro.repository.ContractBillingRuleRepository;
import carevn.luv2code.ez_tro.repository.ContractRepository;
import carevn.luv2code.ez_tro.repository.ContractVersionRepository;
import carevn.luv2code.ez_tro.service.admin.ContractSnapshotService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ContractSnapshotServiceImpl implements ContractSnapshotService {

    private final ContractRepository contractRepository;
    private final ContractVersionRepository contractVersionRepository;
    private final ContractAmendmentRepository contractAmendmentRepository;
    private final ContractBillingRuleRepository contractBillingRuleRepository;

    @Override
    @Transactional(readOnly = true)
    public ContractVersion resolveEffectiveVersionEntity(Contract contract, LocalDate asOfDate) {
        LocalDate effectiveDate = asOfDate == null ? LocalDate.now() : asOfDate;

        return contractVersionRepository
                .findFirstByContractIdAndEffectiveFromLessThanEqualAndEffectiveToGreaterThanEqual(
                        contract.getId(), effectiveDate, effectiveDate)
                .or(() ->
                        contractVersionRepository
                                .findFirstByContractIdAndEffectiveFromLessThanEqualAndEffectiveToIsNullOrderByVersionNumberDesc(
                                        contract.getId(), effectiveDate))
                .orElseGet(() -> contractVersionRepository
                        .findTopByContractIdOrderByVersionNumberDesc(contract.getId())
                        .orElse(null));
    }

    @Override
    @Transactional(readOnly = true)
    public ContractVersionSummaryResponse getCurrentVersion(Integer contractId, LocalDate asOfDate) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));

        ContractVersion version = resolveEffectiveVersionEntity(contract, asOfDate);
        return toVersionSummary(version);
    }

    @Override
    @Transactional(readOnly = true)
    public ContractSnapshotResponse getSnapshot(Integer contractId, LocalDate asOfDate) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));

        LocalDate effectiveDate = asOfDate == null ? LocalDate.now() : asOfDate;
        ContractVersion currentVersion = resolveEffectiveVersionEntity(contract, effectiveDate);

        List<ContractAmendmentSummaryResponse> activeAmendments =
                contractAmendmentRepository
                        .findByContractIdAndEffectiveFromLessThanEqual(contractId, effectiveDate)
                        .stream()
                        .filter(amendment -> amendment.getEffectiveTo() == null
                                || !amendment.getEffectiveTo().isBefore(effectiveDate))
                        .map(this::toAmendmentSummary)
                        .toList();

        List<ContractBillingRuleSummaryResponse> activeBillingRules =
                contractBillingRuleRepository
                        .findByContractIdAndIsActiveTrueAndEffectiveFromLessThanEqual(contractId, effectiveDate)
                        .stream()
                        .filter(rule -> rule.getEffectiveTo() == null
                                || !rule.getEffectiveTo().isBefore(effectiveDate))
                        .map(this::toBillingRuleSummary)
                        .toList();

        return ContractSnapshotResponse.builder()
                .contractId(contract.getId())
                .contractCode(contract.getContractCode())
                .organizationId(
                        contract.getOrganization() == null
                                ? null
                                : contract.getOrganization().getId())
                .roomId(contract.getRoom() == null ? null : contract.getRoom().getId())
                .tenantId(
                        contract.getTenant() == null
                                ? null
                                : contract.getTenant().getId())
                .contractStatus(contract.getStatus())
                .contractStartDate(contract.getStartDate())
                .contractEndDate(contract.getEndDate())
                .asOfDate(effectiveDate)
                .currentVersion(toVersionSummary(currentVersion))
                .activeAmendments(activeAmendments)
                .activeBillingRules(activeBillingRules)
                .build();
    }

    private ContractVersionSummaryResponse toVersionSummary(ContractVersion version) {
        if (version == null) {
            return null;
        }

        return ContractVersionSummaryResponse.builder()
                .id(version.getId())
                .versionNumber(version.getVersionNumber())
                .price(version.getPrice())
                .depositAmount(version.getDepositAmount())
                .billingCycle(version.getBillingCycle())
                .paymentCycleMonths(version.getPaymentCycleMonths())
                .monthlyPaymentDay(version.getMonthlyPaymentDay())
                .effectiveFrom(version.getEffectiveFrom())
                .effectiveTo(version.getEffectiveTo())
                .note(version.getNote())
                .createdBy(
                        version.getCreatedBy() == null
                                ? null
                                : version.getCreatedBy().getId())
                .createdAt(version.getCreatedAt())
                .build();
    }

    private ContractAmendmentSummaryResponse toAmendmentSummary(ContractAmendment amendment) {
        return ContractAmendmentSummaryResponse.builder()
                .id(amendment.getId())
                .amendmentType(amendment.getAmendmentType())
                .effectiveFrom(amendment.getEffectiveFrom())
                .effectiveTo(amendment.getEffectiveTo())
                .dataJson(amendment.getDataJson())
                .note(amendment.getNote())
                .createdBy(
                        amendment.getCreatedBy() == null
                                ? null
                                : amendment.getCreatedBy().getId())
                .createdAt(amendment.getCreatedAt())
                .build();
    }

    private ContractBillingRuleSummaryResponse toBillingRuleSummary(ContractBillingRule rule) {
        return ContractBillingRuleSummaryResponse.builder()
                .id(rule.getId())
                .utilityId(rule.getUtility() == null ? null : rule.getUtility().getId())
                .utilityName(
                        rule.getUtility() == null ? null : rule.getUtility().getName())
                .cycle(rule.getCycle())
                .unitPrice(rule.getUnitPrice())
                .calculationType(rule.getCalculationType())
                .effectiveFrom(rule.getEffectiveFrom())
                .effectiveTo(rule.getEffectiveTo())
                .active(rule.getIsActive())
                .note(rule.getNote())
                .build();
    }
}
