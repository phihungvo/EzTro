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
import carevn.luv2code.ez_tro.entity.RoomUtility;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.repository.ContractAmendmentRepository;
import carevn.luv2code.ez_tro.repository.ContractBillingRuleRepository;
import carevn.luv2code.ez_tro.repository.ContractRepository;
import carevn.luv2code.ez_tro.repository.ContractVersionRepository;
import carevn.luv2code.ez_tro.repository.RoomUtilityRepository;
import carevn.luv2code.ez_tro.service.admin.ContractSnapshotService;
import lombok.RequiredArgsConstructor;

/**
 * Service dựng snapshot của hợp đồng tại một thời điểm.
 *
 * <p>Snapshot bao gồm:
 * <ul>
 *   <li>Root contract (trạng thái, phòng, tenant...).</li>
 *   <li>Version điều khoản đang hiệu lực tại {@code asOfDate}.</li>
 *   <li>Danh sách amendments và billing rules còn hiệu lực.</li>
 * </ul>
 *
 * <p>Service này được các luồng billing/contract sử dụng để đảm bảo tính đúng theo timeline (effectiveFrom/effectiveTo).
 */
@Service
@RequiredArgsConstructor
public class ContractSnapshotServiceImpl implements ContractSnapshotService {

    private final ContractRepository contractRepository;
    private final ContractVersionRepository contractVersionRepository;
    private final ContractAmendmentRepository contractAmendmentRepository;
    private final ContractBillingRuleRepository contractBillingRuleRepository;
    private final RoomUtilityRepository roomUtilityRepository;

    /**
     * Resolve entity {@link ContractVersion} đang hiệu lực tại {@code asOfDate}.
     *
     * <p>Thứ tự ưu tiên:
     * <ul>
     *   <li>Version có effectiveFrom <= date <= effectiveTo (nếu effectiveTo không null).</li>
     *   <li>Nếu không có, lấy version có effectiveTo null và effectiveFrom <= date.</li>
     *   <li>Nếu vẫn không có, fallback version mới nhất theo versionNumber.</li>
     * </ul>
     *
     * @param contract hợp đồng
     * @param asOfDate ngày muốn tra version (null -> today)
     * @return version entity đang hiệu lực (có thể null)
     */
    @Override
    @Transactional(readOnly = true)
    public ContractVersion resolveEffectiveVersionEntity(Contract contract, LocalDate asOfDate) {
        LocalDate effectiveDate = asOfDate == null ? LocalDate.now() : asOfDate;

        return contractVersionRepository
                .findFirstByContractIdAndEffectiveFromLessThanEqualAndEffectiveToGreaterThanEqualOrderByVersionNumberDesc(
                        contract.getId(), effectiveDate, effectiveDate)
                .or(() ->
                        contractVersionRepository
                                .findFirstByContractIdAndEffectiveFromLessThanEqualAndEffectiveToIsNullOrderByVersionNumberDesc(
                                        contract.getId(), effectiveDate))
                .orElseGet(() -> contractVersionRepository
                        .findTopByContractIdOrderByVersionNumberDesc(contract.getId())
                        .orElse(null));
    }

    /**
     * Lấy version summary đang hiệu lực của hợp đồng tại một thời điểm.
     *
     * @param contractId id hợp đồng
     * @param asOfDate ngày muốn tra version (null -> today)
     * @return version summary (có thể null)
     */
    @Override
    @Transactional(readOnly = true)
    public ContractVersionSummaryResponse getCurrentVersion(Integer contractId, LocalDate asOfDate) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));

        ContractVersion version = resolveEffectiveVersionEntity(contract, asOfDate);
        return toVersionSummary(version);
    }

    /**
     * Dựng snapshot hợp đồng tại {@code asOfDate}.
     *
     * @param contractId id hợp đồng
     * @param asOfDate ngày muốn dựng snapshot (null -> today)
     * @return snapshot response
     */
    @Override
    @Transactional(readOnly = true)
    public ContractSnapshotResponse getSnapshot(Integer contractId, LocalDate asOfDate) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));

        LocalDate effectiveDate = asOfDate == null ? LocalDate.now() : asOfDate;
        ContractVersion currentVersion = resolveEffectiveVersionEntity(contract, effectiveDate);
        var utilityQuantityById = resolveUtilityQuantityById(contract, effectiveDate);

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
                        .map(rule -> toBillingRuleSummary(rule, utilityQuantityById))
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

    private java.util.Map<Integer, Integer> resolveUtilityQuantityById(Contract contract, LocalDate effectiveDate) {
        Integer roomId = contract.getRoom() != null ? contract.getRoom().getId() : null;
        if (roomId == null) {
            return java.util.Map.of();
        }

        return roomUtilityRepository.findActiveByRoomId(roomId).stream()
                .filter(roomUtility -> roomUtility.getUtility() != null
                        && roomUtility.getUtility().getId() != null)
                .filter(roomUtility -> roomUtility.getStartDate() == null
                        || !roomUtility.getStartDate().isAfter(effectiveDate))
                .filter(roomUtility -> roomUtility.getEndDate() == null
                        || !roomUtility.getEndDate().isBefore(effectiveDate))
                .collect(java.util.stream.Collectors.toMap(
                        roomUtility -> roomUtility.getUtility().getId(),
                        roomUtility -> normalizeUtilityQuantity(roomUtility),
                        (left, right) -> right,
                        java.util.LinkedHashMap::new));
    }

    private int normalizeUtilityQuantity(RoomUtility roomUtility) {
        Integer quantity = roomUtility == null ? null : roomUtility.getQuantity();
        return quantity == null || quantity < 1 ? 1 : quantity;
    }

    private ContractBillingRuleSummaryResponse toBillingRuleSummary(
            ContractBillingRule rule, java.util.Map<Integer, Integer> utilityQuantityById) {
        Integer utilityId = rule.getUtility() == null ? null : rule.getUtility().getId();
        return ContractBillingRuleSummaryResponse.builder()
                .id(rule.getId())
                .utilityId(utilityId)
                .utilityName(
                        rule.getUtility() == null ? null : rule.getUtility().getName())
                .quantity(utilityId == null ? 1 : utilityQuantityById.getOrDefault(utilityId, 1))
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
