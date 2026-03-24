package carevn.luv2code.ez_tro.service.admin.impl;

import static carevn.luv2code.ez_tro.constants.AppConstants.CODE_TIMESTAMP_FORMAT;
import static carevn.luv2code.ez_tro.constants.AppConstants.CONTRACT_CODE_PREFIX;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.requests.BillRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractAmendmentCreateRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractBillingRuleCreateRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractRoomTransferRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractTenantRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractTerminateRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractUtilityRequest;
import carevn.luv2code.ez_tro.dto.requests.DepositTransactionCreateRequest;
import carevn.luv2code.ez_tro.dto.response.BillResponse;
import carevn.luv2code.ez_tro.dto.response.ContractAmendmentSummaryResponse;
import carevn.luv2code.ez_tro.dto.response.ContractBillingRuleSummaryResponse;
import carevn.luv2code.ez_tro.dto.response.ContractDetailResponse;
import carevn.luv2code.ez_tro.dto.response.ContractResponse;
import carevn.luv2code.ez_tro.dto.response.ContractRoomTransferResponse;
import carevn.luv2code.ez_tro.dto.response.ContractSettlementPreviewResponse;
import carevn.luv2code.ez_tro.dto.response.ContractSnapshotResponse;
import carevn.luv2code.ez_tro.dto.response.ContractStateTransitionResponse;
import carevn.luv2code.ez_tro.dto.response.ContractUtilityDetailResponse;
import carevn.luv2code.ez_tro.dto.response.ContractVersionSummaryResponse;
import carevn.luv2code.ez_tro.dto.response.DepositLedgerSummaryResponse;
import carevn.luv2code.ez_tro.dto.response.DepositTransactionSummaryResponse;
import carevn.luv2code.ez_tro.entity.Bill;
import carevn.luv2code.ez_tro.entity.BoardingHouse;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.ContractAmendment;
import carevn.luv2code.ez_tro.entity.ContractBillingRule;
import carevn.luv2code.ez_tro.entity.ContractStateTransition;
import carevn.luv2code.ez_tro.entity.ContractVersion;
import carevn.luv2code.ez_tro.entity.DepositTransaction;
import carevn.luv2code.ez_tro.entity.Organization;
import carevn.luv2code.ez_tro.entity.Room;
import carevn.luv2code.ez_tro.entity.RoomUtility;
import carevn.luv2code.ez_tro.entity.RoomUtilityId;
import carevn.luv2code.ez_tro.entity.Tenant;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.entity.Utility;
import carevn.luv2code.ez_tro.enums.*;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.BillMapper;
import carevn.luv2code.ez_tro.mapper.ContractMapper;
import carevn.luv2code.ez_tro.repository.BillRepository;
import carevn.luv2code.ez_tro.repository.BoardingHouseRepository;
import carevn.luv2code.ez_tro.repository.ContractAmendmentRepository;
import carevn.luv2code.ez_tro.repository.ContractBillingRuleRepository;
import carevn.luv2code.ez_tro.repository.ContractRepository;
import carevn.luv2code.ez_tro.repository.ContractStateTransitionRepository;
import carevn.luv2code.ez_tro.repository.ContractVersionRepository;
import carevn.luv2code.ez_tro.repository.DepositTransactionRepository;
import carevn.luv2code.ez_tro.repository.OrganizationRepository;
import carevn.luv2code.ez_tro.repository.RoomRepository;
import carevn.luv2code.ez_tro.repository.RoomUtilityRepository;
import carevn.luv2code.ez_tro.repository.TenantRepository;
import carevn.luv2code.ez_tro.repository.UserRepository;
import carevn.luv2code.ez_tro.repository.UtilityRepository;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.ContractService;
import carevn.luv2code.ez_tro.service.admin.ContractSnapshotService;
import carevn.luv2code.ez_tro.specification.ContractSpecs;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContractServiceImpl implements ContractService {

    private final ContractRepository contractRepository;
    private final RoomRepository roomRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final BillRepository billRepository;
    private final UtilityRepository utilityRepository;
    private final RoomUtilityRepository roomUtilityRepository;
    private final BoardingHouseRepository boardingHouseRepository;
    private final ContractVersionRepository contractVersionRepository;
    private final ContractAmendmentRepository contractAmendmentRepository;
    private final ContractBillingRuleRepository contractBillingRuleRepository;
    private final DepositTransactionRepository depositTransactionRepository;
    private final ContractStateTransitionRepository contractStateTransitionRepository;
    private final OrganizationRepository organizationRepository;
    private final ContractMapper contractMapper;
    private final BillMapper billMapper;
    private final PasswordEncoder passwordEncoder;
    private final ResourceLimitServiceImpl resourceLimitService;
    private final ContractSnapshotService contractSnapshotService;

    @Override
    @Transactional
    public ContractResponse create(ContractRequest request) {
        Room room = roomRepository
                .findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        validateRoomAccess(room);

        Tenant tenant =
                resolveTenant(request, room.getBoardingHouse().getOwner().getId());

        if (contractRepository.existsByRoomIdAndStatusIn(
                request.getRoomId(), Set.of(ContractStatus.ACTIVE, ContractStatus.PENDING))) {
            throw new AppException(ErrorCode.CONTRACT_ROOM_ALREADY_ACTIVE);
        }
        if (request.getEndDate() != null && request.getEndDate().isBefore(request.getStartDate())) {
            throw new AppException(ErrorCode.CONTRACT_END_DATE_INVALID);
        }

        Contract contract = contractMapper.toEntity(request);
        contract.setRoom(room);
        contract.setTenant(tenant);
        contract.setOrganization(room.getBoardingHouse().getOrganization());
        contract.setStatus(resolveLifecycleStatus(request.getStatus(), request.getStartDate(), request.getEndDate()));

        if (contract.getContractCode() == null) {
            String timestamp = new SimpleDateFormat(CODE_TIMESTAMP_FORMAT).format(new Date());
            contract.setContractCode(CONTRACT_CODE_PREFIX + timestamp);
        }

        contractRepository.saveAndFlush(contract);
        seedInitialVersion(contract, request);
        recordStateTransition(contract, null, contract.getStatus(), "CONTRACT_CREATED");
        if (request.getUtilities() != null) {
            syncRoomUtilities(room, request);
        }
        syncRoomOccupancyStatus(room);
        return contractMapper.toResponse(contract);
    }

    @Override
    public ContractResponse update(Integer id, ContractRequest request) {
        Contract contract =
                contractRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);

        if (!contract.getRoom().getId().equals(request.getRoomId())) {
            throw new AppException(ErrorCode.CONTRACT_ROOM_CHANGE_NOT_ALLOWED);
        }
        if (request.getTenantId() != null
                && !request.getTenantId().equals(contract.getTenant().getId())) {
            throw new AppException(ErrorCode.CONTRACT_TENANT_CHANGE_NOT_ALLOWED);
        }
        if (request.getTenant() != null) {
            throw new AppException(ErrorCode.CONTRACT_TENANT_CHANGE_NOT_ALLOWED);
        }
        if (request.getUtilities() != null) {
            throw new AppException(ErrorCode.CONTRACT_UTILITIES_UPDATE_NOT_ALLOWED);
        }

        if (contractRepository.existsByRoomIdAndIdNotAndStatusIn(
                contract.getRoom().getId(), id, Set.of(ContractStatus.ACTIVE, ContractStatus.PENDING))) {
            throw new AppException(ErrorCode.CONTRACT_ROOM_ALREADY_ACTIVE);
        }
        if (request.getEndDate() != null && request.getEndDate().isBefore(request.getStartDate())) {
            throw new AppException(ErrorCode.CONTRACT_END_DATE_INVALID);
        }

        ContractStatus previousStatus = contract.getStatus();
        boolean financialTermsChanged = hasFinancialTermsChanged(contract, request);

        contract.setStartDate(request.getStartDate());
        contract.setEndDate(request.getEndDate());
        contract.setDeposit(request.getDeposit());
        contract.setRentPrice(request.getRentPrice());
        contract.setOrganization(contract.getRoom().getBoardingHouse().getOrganization());
        contract.setStatus(resolveLifecycleStatus(request.getStatus(), request.getStartDate(), request.getEndDate()));
        contract.setNote(request.getNote());
        contract.setDepositReceivedAt(request.getDepositReceivedAt());
        contract.setDepositPaymentMethod(request.getDepositPaymentMethod());
        contract.setPaymentCycleMonths(request.getPaymentCycleMonths());
        contract.setMonthlyPaymentDay(request.getMonthlyPaymentDay());
        contract.setUpdatedAt(new Date());

        contractRepository.saveAndFlush(contract);
        bootstrapLegacyVersion(contract, request, financialTermsChanged);
        if (previousStatus != contract.getStatus()) {
            recordStateTransition(contract, previousStatus, contract.getStatus(), "CONTRACT_UPDATED");
        }
        syncRoomOccupancyStatus(contract.getRoom());
        return contractMapper.toResponse(contract);
    }

    @Override
    @Transactional
    public void delete(Integer id) {
        Contract contract =
                contractRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);
        Room room = contract.getRoom();
        contractRepository.delete(contract);
        contractRepository.flush();
        syncRoomOccupancyStatus(room);
    }

    @Override
    @Transactional(readOnly = true)
    public ContractDetailResponse getById(Integer id) {
        Contract contract =
                contractRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);
        return toDetailResponse(contract);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContractResponse> getAllActiveContracts() {
        SecurityUtils.SpecificationSafeUser safe = SecurityUtils.safeUser();

        Specification<Contract> spec = ContractSpecs.isActive();

        if (!safe.isAdmin()) {
            spec = spec.and(ContractSpecs.ownedByOwner(safe.get()));
        }

        return contractRepository.findAll(spec).stream()
                .map(contractMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContractResponse> getAll() {
        SecurityUtils.SpecificationSafeUser safe = SecurityUtils.safeUser();
        Specification<Contract> spec = Specification.where(null);

        if (!safe.isAdmin()) {
            spec = spec.and(ContractSpecs.ownedByOwner(safe.get()));
        }

        return contractRepository.findAll(spec).stream()
                .map(contractMapper::toResponse)
                .toList();
    }

    @Override
    public Page<ContractResponse> getAllContractPaged(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        return contractRepository.findAll(pageRequest).map(contractMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContractResponse> getByRoom(Integer roomId) {
        return contractRepository.findByRoomId(roomId).stream()
                .map(contractMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContractResponse> getByTenant(Integer tenantId) {
        return contractRepository.findByTenantId(tenantId).stream()
                .map(contractMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BillResponse> getBillsByContract(Integer contractId) {
        return billRepository.findByContractId(contractId).stream()
                .map(billMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BillResponse createBillForContract(Integer contractId, Object billRequestObj) {
        BillRequest billRequest = (BillRequest) billRequestObj;
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));

        // map and set link
        carevn.luv2code.ez_tro.entity.Bill bill = billMapper.toEntity(billRequest);
        bill.setContract(contract);
        bill.setCreatedAt(new Date());
        bill.setUpdatedAt(new Date());

        return billMapper.toResponse(billRepository.save(bill));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ContractResponse> filterContracts(
            String search,
            String startDate,
            String endDate,
            String status,
            Integer boardingHouseId,
            Integer roomId,
            int page,
            int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Specification<Contract> spec = Specification.where(null);

        SecurityUtils.SpecificationSafeUser safe = SecurityUtils.safeUser();
        if (!safe.isAdmin()) {
            spec = spec.and(ContractSpecs.ownedByOwner(safe.get()));
        }

        if (search != null && !search.trim().isEmpty()) {
            String lowerSearch = search.toLowerCase().trim();

            spec = spec.and((root, query, cb) -> {
                Predicate codePred = cb.like(cb.lower(root.get("contractCode")), "%" + lowerSearch + "%");

                Predicate roomPred = cb.like(cb.lower(root.join("room").get("roomNumber")), "%" + lowerSearch + "%");

                Join<Contract, Tenant> tenantJoin = root.join("tenant", JoinType.LEFT);
                Join<Tenant, User> userJoin = tenantJoin.join("user", JoinType.LEFT);
                Predicate tenantPred = cb.like(
                        cb.lower(cb.concat(
                                cb.coalesce(userJoin.get("firstName"), cb.literal("")),
                                cb.concat(cb.literal(" "), cb.coalesce(userJoin.get("lastName"), cb.literal(""))))),
                        "%" + lowerSearch + "%");

                return cb.or(codePred, roomPred, tenantPred);
            });
        }

        if (startDate != null && endDate != null && !startDate.isEmpty() && !endDate.isEmpty()) {
            try {
                LocalDate start = LocalDate.parse(startDate);
                LocalDate end = LocalDate.parse(endDate);
                spec = spec.and((root, query, cb) -> cb.between(root.get("startDate"), start, end));
            } catch (Exception e) {
                log.warn("Invalid date format in filter: {}", e.getMessage());
            }
        }

        if (status != null && !status.isEmpty() && !"ALL".equalsIgnoreCase(status)) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), ContractStatus.valueOf(status)));
        }

        // New: Filter by boarding house ID
        if (boardingHouseId != null) {
            spec = spec.and((root, query, cb) -> {
                Join<Contract, Room> roomJoin = root.join("room", JoinType.LEFT);
                return cb.equal(roomJoin.get("boardingHouse").get("id"), boardingHouseId);
            });
        }

        // New: Filter by room ID
        if (roomId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("room").get("id"), roomId));
        }

        Page<Contract> pageResult = contractRepository.findAll(spec, pageable);
        Page<ContractResponse> dtoPage = pageResult.map(contractMapper::toResponse);
        return dtoPage;
    }

    @Override
    @Transactional
    public int backfillContractFoundation() {
        SecurityUtils.SpecificationSafeUser safe = SecurityUtils.safeUser();

        List<BoardingHouse> boardingHouses = boardingHouseRepository.findAll().stream()
                .filter(bh -> safe.isAdmin()
                        || (safe.getId() != null
                                && bh.getOwner() != null
                                && safe.getId().equals(bh.getOwner().getId())))
                .toList();

        for (BoardingHouse boardingHouse : boardingHouses) {
            if (boardingHouse.getOrganization() == null) {
                boardingHouse.setOrganization(resolveOrCreateOrganizationForOwner(boardingHouse));
                boardingHouseRepository.save(boardingHouse);
            }
        }

        List<Contract> contracts = contractRepository.findAll().stream()
                .filter(contract -> safe.isAdmin()
                        || (safe.getId() != null
                                && contract.getRoom() != null
                                && contract.getRoom().getBoardingHouse() != null
                                && contract.getRoom().getBoardingHouse().getOwner() != null
                                && safe.getId()
                                        .equals(contract.getRoom()
                                                .getBoardingHouse()
                                                .getOwner()
                                                .getId())))
                .toList();

        for (Contract contract : contracts) {
            Organization organization = contract.getRoom().getBoardingHouse().getOrganization();
            if (contract.getOrganization() == null) {
                contract.setOrganization(organization);
                contractRepository.save(contract);
            }

            if (contractVersionRepository
                    .findTopByContractIdOrderByVersionNumberDesc(contract.getId())
                    .isEmpty()) {
                seedVersionFromLegacyContract(contract);
            }

            if (contractStateTransitionRepository
                    .findByContractIdOrderByChangedAtDesc(contract.getId())
                    .isEmpty()) {
                recordStateTransition(contract, null, contract.getStatus(), "BACKFILL_INITIAL_STATE");
            }

            if (contractBillingRuleRepository
                    .findByContractIdAndIsActiveTrueOrderByEffectiveFromDesc(contract.getId())
                    .isEmpty()) {
                seedBillingRulesFromRoomUtilities(contract);
            }

            if (depositTransactionRepository
                    .findByContractIdOrderByOccurredAtDesc(contract.getId())
                    .isEmpty()) {
                seedDepositLedgerFromLegacyContract(contract);
            }
        }

        return contracts.size();
    }

    @Override
    @Transactional(readOnly = true)
    public ContractVersionSummaryResponse getCurrentVersion(Integer contractId, LocalDate asOfDate) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);
        return contractSnapshotService.getCurrentVersion(contractId, asOfDate);
    }

    @Override
    @Transactional(readOnly = true)
    public ContractSnapshotResponse getSnapshot(Integer contractId, LocalDate asOfDate) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);
        return contractSnapshotService.getSnapshot(contractId, asOfDate);
    }

    @Override
    @Transactional
    public ContractAmendmentSummaryResponse createAmendment(
            Integer contractId, ContractAmendmentCreateRequest request) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);
        validateEffectiveDates(request.getEffectiveFrom(), request.getEffectiveTo());

        ContractAmendment amendment = ContractAmendment.builder()
                .organization(contract.getOrganization())
                .contract(contract)
                .amendmentType(request.getAmendmentType())
                .effectiveFrom(request.getEffectiveFrom())
                .effectiveTo(request.getEffectiveTo())
                .dataJson(request.getDataJson())
                .note(request.getNote())
                .createdBy(SecurityUtils.getCurrentUser())
                .build();
        ContractAmendment savedAmendment = contractAmendmentRepository.save(amendment);

        if (hasVersionOverride(request)) {
            createVersionFromAmendment(contract, request);
        }

        return toAmendmentSummary(savedAmendment);
    }

    @Override
    @Transactional
    public ContractAmendmentSummaryResponse reviseAmendment(
            Integer contractId, Integer amendmentId, ContractAmendmentCreateRequest request) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);
        validateEffectiveDates(request.getEffectiveFrom(), request.getEffectiveTo());

        ContractAmendment existingAmendment = contractAmendmentRepository
                .findById(amendmentId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        if (!existingAmendment.getContract().getId().equals(contractId)) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        existingAmendment.setEffectiveTo(request.getEffectiveFrom().minusDays(1));
        contractAmendmentRepository.save(existingAmendment);

        ContractAmendmentCreateRequest revisedRequest = ContractAmendmentCreateRequest.builder()
                .amendmentType(request.getAmendmentType())
                .effectiveFrom(request.getEffectiveFrom())
                .effectiveTo(request.getEffectiveTo())
                .price(request.getPrice())
                .depositAmount(request.getDepositAmount())
                .paymentCycleMonths(request.getPaymentCycleMonths())
                .monthlyPaymentDay(request.getMonthlyPaymentDay())
                .dataJson(request.getDataJson())
                .note(buildRevisionNote(request.getNote(), "Revision of amendment #" + amendmentId))
                .build();
        return createAmendment(contractId, revisedRequest);
    }

    @Override
    @Transactional
    public ContractBillingRuleSummaryResponse createBillingRule(
            Integer contractId, ContractBillingRuleCreateRequest request) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);
        validateEffectiveDates(request.getEffectiveFrom(), request.getEffectiveTo());

        Utility utility = utilityRepository
                .findById(request.getUtilityId())
                .orElseThrow(() -> new AppException(ErrorCode.UTILITY_NOT_FOUND));
        Integer utilityBoardingHouseId = utility.getBoardingHouse() == null
                ? null
                : utility.getBoardingHouse().getId();
        Integer contractBoardingHouseId = contract.getRoom().getBoardingHouse().getId();
        if (utilityBoardingHouseId != null && !utilityBoardingHouseId.equals(contractBoardingHouseId)) {
            throw new AppException(ErrorCode.UTILITY_NOT_BELONG_TO_ROOM_BOARDING_HOUSE);
        }

        ContractBillingRule billingRule = ContractBillingRule.builder()
                .organization(contract.getOrganization())
                .contract(contract)
                .utility(utility)
                .cycle(request.getCycle())
                .unitPrice(request.getUnitPrice())
                .calculationType(request.getCalculationType())
                .effectiveFrom(request.getEffectiveFrom())
                .effectiveTo(request.getEffectiveTo())
                .isActive(true)
                .note(request.getNote())
                .build();
        return toBillingRuleSummary(contractBillingRuleRepository.save(billingRule));
    }

    @Override
    @Transactional
    public ContractBillingRuleSummaryResponse reviseBillingRule(
            Integer contractId, Integer billingRuleId, ContractBillingRuleCreateRequest request) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);
        validateEffectiveDates(request.getEffectiveFrom(), request.getEffectiveTo());

        ContractBillingRule existingRule = contractBillingRuleRepository
                .findById(billingRuleId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_BILLING_RULE_NOT_FOUND));
        if (!existingRule.getContract().getId().equals(contractId)) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        existingRule.setIsActive(false);
        existingRule.setEffectiveTo(request.getEffectiveFrom().minusDays(1));
        contractBillingRuleRepository.save(existingRule);

        ContractBillingRuleCreateRequest revisedRequest = ContractBillingRuleCreateRequest.builder()
                .utilityId(request.getUtilityId())
                .cycle(request.getCycle())
                .unitPrice(request.getUnitPrice())
                .calculationType(request.getCalculationType())
                .effectiveFrom(request.getEffectiveFrom())
                .effectiveTo(request.getEffectiveTo())
                .note(buildRevisionNote(request.getNote(), "Revision of billing rule #" + billingRuleId))
                .build();
        return createBillingRule(contractId, revisedRequest);
    }

    @Override
    @Transactional
    public ContractBillingRuleSummaryResponse deactivateBillingRule(Integer contractId, Integer billingRuleId) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);

        ContractBillingRule billingRule = contractBillingRuleRepository
                .findById(billingRuleId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_BILLING_RULE_NOT_FOUND));
        if (!billingRule.getContract().getId().equals(contractId)) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        billingRule.setIsActive(false);
        if (billingRule.getEffectiveTo() == null || billingRule.getEffectiveTo().isAfter(LocalDate.now())) {
            billingRule.setEffectiveTo(LocalDate.now());
        }
        return toBillingRuleSummary(contractBillingRuleRepository.save(billingRule));
    }

    @Override
    @Transactional
    public DepositTransactionSummaryResponse createDepositTransaction(
            Integer contractId, DepositTransactionCreateRequest request) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);
        if (request.getAmount() == null || request.getAmount().signum() <= 0) {
            throw new AppException(ErrorCode.DEPOSIT_TRANSACTION_AMOUNT_INVALID);
        }

        DepositTransaction depositTransaction = DepositTransaction.builder()
                .organization(contract.getOrganization())
                .contract(contract)
                .transactionType(request.getTransactionType())
                .amount(request.getAmount())
                .currency(
                        request.getCurrency() == null || request.getCurrency().isBlank()
                                ? "VND"
                                : request.getCurrency())
                .referenceType(request.getReferenceType())
                .referenceId(request.getReferenceId())
                .note(request.getNote())
                .occurredAt(request.getOccurredAt())
                .createdBy(SecurityUtils.getCurrentUser())
                .build();
        return toDepositTransactionSummary(depositTransactionRepository.save(depositTransaction));
    }

    @Override
    @Transactional
    public ContractDetailResponse finalizeSettlement(Integer contractId) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);

        List<DepositTransaction> existingTransactions =
                depositTransactionRepository.findByContractIdOrderByOccurredAtDesc(contractId);
        List<carevn.luv2code.ez_tro.entity.Bill> bills = billRepository.findByContractId(contractId);
        ContractSettlementPreviewResponse settlementPreview = toSettlementPreview(bills, existingTransactions);

        if (settlementPreview.getEstimatedAdditionalCharge().signum() > 0) {
            throw new AppException(ErrorCode.CONTRACT_SETTLEMENT_INSUFFICIENT_DEPOSIT);
        }

        User currentUser = SecurityUtils.getCurrentUser();
        Date now = new Date();

        if (settlementPreview.getUnpaidBillsTotal().signum() > 0) {
            DepositTransaction deduction = DepositTransaction.builder()
                    .organization(contract.getOrganization())
                    .contract(contract)
                    .transactionType(DepositTransactionType.DEDUCT_FOR_UNPAID_INVOICE)
                    .amount(settlementPreview.getUnpaidBillsTotal())
                    .currency("VND")
                    .referenceType(DepositReferenceType.SETTLEMENT)
                    .note("Khau tru tien coc de tat toan hoa don mo")
                    .occurredAt(now)
                    .createdBy(currentUser)
                    .build();
            depositTransactionRepository.save(deduction);

            for (carevn.luv2code.ez_tro.entity.Bill bill : bills) {
                if (bill.getStatus() != BillStatus.PAID) {
                    bill.setStatus(BillStatus.PAID);
                    bill.setPaymentDate(now);
                }
            }
            billRepository.saveAll(bills);
        }

        if (settlementPreview.getEstimatedRefundAmount().signum() > 0) {
            DepositTransaction refund = DepositTransaction.builder()
                    .organization(contract.getOrganization())
                    .contract(contract)
                    .transactionType(DepositTransactionType.REFUND)
                    .amount(settlementPreview.getEstimatedRefundAmount())
                    .currency("VND")
                    .referenceType(DepositReferenceType.SETTLEMENT)
                    .note("Hoan coc khi dong hop dong")
                    .occurredAt(now)
                    .createdBy(currentUser)
                    .build();
            depositTransactionRepository.save(refund);
        }

        ContractStatus previousStatus = contract.getStatus();
        contract.setStatus(ContractStatus.CANCELLED);
        if (contract.getEndDate() == null || contract.getEndDate().isAfter(LocalDate.now())) {
            contract.setEndDate(LocalDate.now());
        }
        contract.setUpdatedAt(now);
        contractRepository.saveAndFlush(contract);
        recordStateTransition(contract, previousStatus, contract.getStatus(), "FINAL_SETTLEMENT");
        syncRoomOccupancyStatus(contract.getRoom());

        return toDetailResponse(contract);
    }

    @Override
    @Transactional
    public ContractDetailResponse terminate(Integer contractId, ContractTerminateRequest request) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);
        validateEffectiveDates(request.getTerminationDate(), request.getTerminationDate());

        createTerminationProrationBill(contract, request.getTerminationDate());

        ContractStatus previousStatus = contract.getStatus();
        contract.setStatus(ContractStatus.CANCELLED);
        contract.setEndDate(request.getTerminationDate());
        if (request.getNote() != null && !request.getNote().isBlank()) {
            contract.setNote(appendNote(contract.getNote(), "Cham dut: " + request.getNote()));
        }
        contract.setUpdatedAt(new Date());
        contractRepository.saveAndFlush(contract);
        recordStateTransition(contract, previousStatus, contract.getStatus(), "CONTRACT_TERMINATED");
        syncRoomOccupancyStatus(contract.getRoom());
        return toDetailResponse(contract);
    }

    @Override
    @Transactional
    public ContractRoomTransferResponse transferRoom(Integer contractId, ContractRoomTransferRequest request) {
        Contract sourceContract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(sourceContract);
        validateEffectiveDates(request.getTransferDate(), request.getTransferDate());

        Room targetRoom = roomRepository
                .findById(request.getTargetRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        validateRoomAccess(targetRoom);

        if (sourceContract.getRoom().getId().equals(targetRoom.getId())) {
            throw new AppException(ErrorCode.ROOM_STATUS_INVALID);
        }
        if (contractRepository.existsByRoomIdAndStatusIn(
                targetRoom.getId(), Set.of(ContractStatus.ACTIVE, ContractStatus.PENDING))) {
            throw new AppException(ErrorCode.CONTRACT_ROOM_ALREADY_ACTIVE);
        }

        ContractVersion effectiveVersion =
                contractSnapshotService.resolveEffectiveVersionEntity(sourceContract, request.getTransferDate());
        BigDecimal sourceDepositBalance = toDepositLedgerSummary(
                        depositTransactionRepository.findByContractIdOrderByOccurredAtDesc(sourceContract.getId()))
                .getCurrentBalance();
        LocalDate originalEndDate = sourceContract.getEndDate();
        ContractSettlementPreviewResponse sourcePreview = toSettlementPreview(
                billRepository.findByContractId(sourceContract.getId()),
                depositTransactionRepository.findByContractIdOrderByOccurredAtDesc(sourceContract.getId()));

        boolean transferDeposit = Boolean.TRUE.equals(request.getTransferDeposit());
        if (transferDeposit && sourcePreview.getUnpaidBillsTotal().signum() > 0) {
            throw new AppException(ErrorCode.CONTRACT_TRANSFER_OPEN_BILLS_NOT_ALLOWED);
        }

        BigDecimal nextRentPrice = request.getNewRentPrice() != null
                ? request.getNewRentPrice()
                : effectiveVersion == null ? sourceContract.getRentPrice() : effectiveVersion.getPrice();
        BigDecimal nextDepositAmount = request.getNewDepositAmount() != null
                ? request.getNewDepositAmount()
                : effectiveVersion == null ? sourceContract.getDeposit() : effectiveVersion.getDepositAmount();

        ContractStatus previousStatus = sourceContract.getStatus();
        sourceContract.setStatus(ContractStatus.CANCELLED);
        sourceContract.setEndDate(request.getTransferDate().minusDays(1));
        sourceContract.setNote(appendNote(sourceContract.getNote(), "Chuyen phong sang " + targetRoom.getRoomNumber()));
        sourceContract.setUpdatedAt(new Date());
        contractRepository.saveAndFlush(sourceContract);
        recordStateTransition(sourceContract, previousStatus, sourceContract.getStatus(), "ROOM_TRANSFER_OUT");

        Contract targetContract = Contract.builder()
                .contractCode(CONTRACT_CODE_PREFIX + new SimpleDateFormat(CODE_TIMESTAMP_FORMAT).format(new Date()))
                .room(targetRoom)
                .tenant(sourceContract.getTenant())
                .organization(targetRoom.getBoardingHouse().getOrganization())
                .startDate(request.getTransferDate())
                .endDate(originalEndDate)
                .deposit(nextDepositAmount)
                .depositReceivedAt(sourceContract.getDepositReceivedAt())
                .depositPaymentMethod(sourceContract.getDepositPaymentMethod())
                .paymentCycleMonths(
                        effectiveVersion == null
                                ? sourceContract.getPaymentCycleMonths()
                                : effectiveVersion.getPaymentCycleMonths())
                .monthlyPaymentDay(
                        effectiveVersion == null
                                ? sourceContract.getMonthlyPaymentDay()
                                : effectiveVersion.getMonthlyPaymentDay())
                .rentPrice(nextRentPrice)
                .status(resolveLifecycleStatus(ContractStatus.ACTIVE, request.getTransferDate(), originalEndDate))
                .note(
                        request.getNote() == null || request.getNote().isBlank()
                                ? "Chuyen phong tu hop dong " + sourceContract.getContractCode()
                                : request.getNote())
                .build();
        contractRepository.saveAndFlush(targetContract);

        createTransferredVersion(targetContract, effectiveVersion, request, nextRentPrice, nextDepositAmount);
        seedBillingRulesFromRoomUtilities(targetContract);
        recordStateTransition(targetContract, null, targetContract.getStatus(), "ROOM_TRANSFER_IN");
        createTransferProrationBills(sourceContract, targetContract, request.getTransferDate());

        BigDecimal transferredDepositAmount = BigDecimal.ZERO;
        if (transferDeposit && sourceDepositBalance.signum() > 0) {
            DepositTransaction transferOut = DepositTransaction.builder()
                    .organization(sourceContract.getOrganization())
                    .contract(sourceContract)
                    .transactionType(DepositTransactionType.TRANSFER_OUT)
                    .amount(sourceDepositBalance)
                    .currency("VND")
                    .referenceType(DepositReferenceType.CONTRACT_TRANSFER)
                    .referenceId(String.valueOf(targetContract.getId()))
                    .note("Chuyen coc sang hop dong moi")
                    .occurredAt(new Date())
                    .createdBy(SecurityUtils.getCurrentUser())
                    .build();
            depositTransactionRepository.save(transferOut);

            DepositTransaction transferIn = DepositTransaction.builder()
                    .organization(targetContract.getOrganization())
                    .contract(targetContract)
                    .transactionType(DepositTransactionType.TRANSFER_IN)
                    .amount(sourceDepositBalance)
                    .currency("VND")
                    .referenceType(DepositReferenceType.CONTRACT_TRANSFER)
                    .referenceId(String.valueOf(sourceContract.getId()))
                    .note("Nhan chuyen coc tu hop dong cu")
                    .occurredAt(new Date())
                    .createdBy(SecurityUtils.getCurrentUser())
                    .build();
            depositTransactionRepository.save(transferIn);
            transferredDepositAmount = sourceDepositBalance;
        }

        syncRoomOccupancyStatus(sourceContract.getRoom());
        syncRoomOccupancyStatus(targetRoom);

        return ContractRoomTransferResponse.builder()
                .sourceContractId(sourceContract.getId())
                .sourceContractCode(sourceContract.getContractCode())
                .targetContractId(targetContract.getId())
                .targetContractCode(targetContract.getContractCode())
                .targetRoomId(targetRoom.getId())
                .targetRoomNumber(targetRoom.getRoomNumber())
                .transferredDepositAmount(transferredDepositAmount)
                .build();
    }

    private ContractStatus resolveLifecycleStatus(
            ContractStatus requestedStatus, LocalDate startDate, LocalDate endDate) {
        if (requestedStatus == ContractStatus.CANCELLED) {
            return ContractStatus.CANCELLED;
        }

        LocalDate today = LocalDate.now();
        if (startDate != null && startDate.isAfter(today)) {
            return ContractStatus.PENDING;
        }

        if (endDate != null && endDate.isBefore(today)) {
            return ContractStatus.EXPIRED;
        }

        return ContractStatus.ACTIVE;
    }

    private void seedInitialVersion(Contract contract, ContractRequest request) {
        ContractVersion version = ContractVersion.builder()
                .organization(contract.getOrganization())
                .contract(contract)
                .versionNumber(1)
                .price(request.getRentPrice())
                .depositAmount(request.getDeposit())
                .billingCycle(resolveBillingCycle(request.getPaymentCycleMonths()))
                .paymentCycleMonths(request.getPaymentCycleMonths())
                .monthlyPaymentDay(request.getMonthlyPaymentDay())
                .effectiveFrom(request.getStartDate())
                .effectiveTo(request.getEndDate())
                .note("Initial version created from contract create flow")
                .createdBy(SecurityUtils.getCurrentUser())
                .build();
        contractVersionRepository.save(version);
    }

    private void seedVersionFromLegacyContract(Contract contract) {
        ContractVersion version = ContractVersion.builder()
                .organization(contract.getOrganization())
                .contract(contract)
                .versionNumber(1)
                .price(contract.getRentPrice())
                .depositAmount(contract.getDeposit())
                .billingCycle(resolveBillingCycle(contract.getPaymentCycleMonths()))
                .paymentCycleMonths(contract.getPaymentCycleMonths())
                .monthlyPaymentDay(contract.getMonthlyPaymentDay())
                .effectiveFrom(contract.getStartDate())
                .effectiveTo(contract.getEndDate())
                .note("Backfilled from legacy contract record")
                .createdAt(contract.getCreatedAt())
                .updatedAt(contract.getUpdatedAt())
                .build();
        contractVersionRepository.save(version);
    }

    private boolean hasVersionOverride(ContractAmendmentCreateRequest request) {
        return request.getPrice() != null
                || request.getDepositAmount() != null
                || request.getPaymentCycleMonths() != null
                || request.getMonthlyPaymentDay() != null;
    }

    private void createVersionFromAmendment(Contract contract, ContractAmendmentCreateRequest request) {
        ContractVersion latestVersion = contractVersionRepository
                .findTopByContractIdOrderByVersionNumberDesc(contract.getId())
                .orElse(null);

        BigDecimal nextPrice = request.getPrice() != null
                ? request.getPrice()
                : latestVersion == null ? contract.getRentPrice() : latestVersion.getPrice();
        BigDecimal nextDeposit = request.getDepositAmount() != null
                ? request.getDepositAmount()
                : latestVersion == null ? contract.getDeposit() : latestVersion.getDepositAmount();
        Integer nextPaymentCycleMonths = request.getPaymentCycleMonths() != null
                ? request.getPaymentCycleMonths()
                : latestVersion == null ? contract.getPaymentCycleMonths() : latestVersion.getPaymentCycleMonths();
        Integer nextMonthlyPaymentDay = request.getMonthlyPaymentDay() != null
                ? request.getMonthlyPaymentDay()
                : latestVersion == null ? contract.getMonthlyPaymentDay() : latestVersion.getMonthlyPaymentDay();

        if (latestVersion != null
                && latestVersion.getEffectiveFrom() != null
                && !request.getEffectiveFrom().isBefore(latestVersion.getEffectiveFrom())) {
            LocalDate previousEffectiveTo = request.getEffectiveFrom().minusDays(1);
            if (latestVersion.getEffectiveTo() == null
                    || latestVersion.getEffectiveTo().isAfter(previousEffectiveTo)) {
                latestVersion.setEffectiveTo(previousEffectiveTo);
                contractVersionRepository.save(latestVersion);
            }
        }

        ContractVersion nextVersion = ContractVersion.builder()
                .organization(contract.getOrganization())
                .contract(contract)
                .versionNumber(latestVersion == null ? 1 : latestVersion.getVersionNumber() + 1)
                .price(nextPrice)
                .depositAmount(nextDeposit)
                .billingCycle(resolveBillingCycle(nextPaymentCycleMonths))
                .paymentCycleMonths(nextPaymentCycleMonths)
                .monthlyPaymentDay(nextMonthlyPaymentDay)
                .effectiveFrom(request.getEffectiveFrom())
                .effectiveTo(request.getEffectiveTo())
                .note("Auto-generated version from amendment")
                .createdBy(SecurityUtils.getCurrentUser())
                .build();
        contractVersionRepository.save(nextVersion);

        if (!request.getEffectiveFrom().isAfter(LocalDate.now())) {
            contract.setRentPrice(nextPrice);
            contract.setDeposit(nextDeposit);
            contract.setPaymentCycleMonths(nextPaymentCycleMonths);
            contract.setMonthlyPaymentDay(nextMonthlyPaymentDay);
            contractRepository.save(contract);
        }
    }

    private void createTransferredVersion(
            Contract targetContract,
            ContractVersion effectiveVersion,
            ContractRoomTransferRequest request,
            BigDecimal nextRentPrice,
            BigDecimal nextDepositAmount) {
        ContractVersion version = ContractVersion.builder()
                .organization(targetContract.getOrganization())
                .contract(targetContract)
                .versionNumber(1)
                .price(nextRentPrice)
                .depositAmount(nextDepositAmount)
                .billingCycle(
                        effectiveVersion == null
                                ? resolveBillingCycle(targetContract.getPaymentCycleMonths())
                                : effectiveVersion.getBillingCycle())
                .paymentCycleMonths(targetContract.getPaymentCycleMonths())
                .monthlyPaymentDay(targetContract.getMonthlyPaymentDay())
                .effectiveFrom(request.getTransferDate())
                .effectiveTo(targetContract.getEndDate())
                .note("Initial version from room transfer")
                .createdBy(SecurityUtils.getCurrentUser())
                .build();
        contractVersionRepository.save(version);
    }

    private void createTerminationProrationBill(Contract contract, LocalDate terminationDate) {
        LocalDate periodStart = terminationDate.withDayOfMonth(1);
        LocalDate periodEnd = terminationDate;
        if (contract.getStartDate() != null && contract.getStartDate().isAfter(periodStart)) {
            periodStart = contract.getStartDate();
        }
        createProratedBillIfNeeded(
                contract,
                periodStart,
                periodEnd,
                terminationDate,
                "Hóa đơn chốt khi chấm dứt hợp đồng",
                "Tính tiền theo số ngày thực ở đến ngày chấm dứt");
    }

    private void createTransferProrationBills(
            Contract sourceContract, Contract targetContract, LocalDate transferDate) {
        LocalDate monthStart = transferDate.withDayOfMonth(1);
        LocalDate monthEnd = transferDate.withDayOfMonth(transferDate.lengthOfMonth());

        LocalDate sourceStart = monthStart;
        if (sourceContract.getStartDate() != null
                && sourceContract.getStartDate().isAfter(sourceStart)) {
            sourceStart = sourceContract.getStartDate();
        }
        LocalDate sourceEnd = transferDate.minusDays(1);
        if (!sourceEnd.isBefore(sourceStart)) {
            createProratedBillIfNeeded(
                    sourceContract,
                    sourceStart,
                    sourceEnd,
                    transferDate,
                    "Hóa đơn tách kỳ phòng cũ",
                    "Tính tiền theo số ngày ở trước khi chuyển phòng");
        }

        LocalDate targetEnd = targetContract.getEndDate() != null
                        && targetContract.getEndDate().isBefore(monthEnd)
                ? targetContract.getEndDate()
                : monthEnd;
        if (!targetEnd.isBefore(transferDate)) {
            createProratedBillIfNeeded(
                    targetContract,
                    transferDate,
                    targetEnd,
                    transferDate,
                    "Hóa đơn tách kỳ phòng mới",
                    "Tính tiền theo số ngày ở sau khi chuyển phòng");
        }
    }

    private void createProratedBillIfNeeded(
            Contract contract,
            LocalDate periodStart,
            LocalDate periodEnd,
            LocalDate dueDate,
            String title,
            String notePrefix) {
        if (periodStart == null || periodEnd == null || periodEnd.isBefore(periodStart)) {
            return;
        }

        if (hasAnyBillInMonth(contract.getId(), dueDate)) {
            return;
        }

        ContractSnapshotResponse snapshot = contractSnapshotService.getSnapshot(contract.getId(), periodStart);
        BigDecimal monthlyPrice = snapshot.getCurrentVersion() != null
                        && snapshot.getCurrentVersion().getPrice() != null
                ? snapshot.getCurrentVersion().getPrice()
                : contract.getRentPrice();
        BigDecimal proratedAmount = calculateProratedRent(monthlyPrice, periodStart, periodEnd);
        if (proratedAmount.signum() <= 0) {
            return;
        }

        Bill bill = Bill.builder()
                .billTitle(title)
                .billCode("BILL-" + new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()))
                .contract(contract)
                .room(contract.getRoom())
                .tenant(contract.getTenant())
                .amount(proratedAmount)
                .dueDate(dueDate)
                .serviceAmount(BigDecimal.ZERO)
                .status(BillStatus.UNPAID)
                .note(buildProrationNote(notePrefix, monthlyPrice, periodStart, periodEnd, proratedAmount))
                .createdAt(new Date())
                .build();
        billRepository.save(bill);
    }

    private BigDecimal calculateProratedRent(BigDecimal monthlyPrice, LocalDate periodStart, LocalDate periodEnd) {
        if (monthlyPrice == null || monthlyPrice.signum() <= 0) {
            return BigDecimal.ZERO;
        }
        YearMonth yearMonth = YearMonth.from(periodStart);
        BigDecimal daysInMonth = BigDecimal.valueOf(yearMonth.lengthOfMonth());
        BigDecimal actualDays =
                BigDecimal.valueOf(java.time.temporal.ChronoUnit.DAYS.between(periodStart, periodEnd) + 1L);
        return monthlyPrice
                .divide(daysInMonth, 6, java.math.RoundingMode.HALF_UP)
                .multiply(actualDays)
                .setScale(2, java.math.RoundingMode.HALF_UP);
    }

    private boolean hasAnyBillInMonth(Integer contractId, LocalDate dueDate) {
        return billRepository.findByContractId(contractId).stream()
                .anyMatch(bill -> bill.getDueDate() != null
                        && YearMonth.from(bill.getDueDate()).equals(YearMonth.from(dueDate)));
    }

    private String buildProrationNote(
            String prefix,
            BigDecimal monthlyPrice,
            LocalDate periodStart,
            LocalDate periodEnd,
            BigDecimal proratedAmount) {
        return prefix
                + "\n\nDon gia thang: "
                + monthlyPrice
                + "\nKy tinh: "
                + periodStart
                + " -> "
                + periodEnd
                + "\nSo ngay tinh tien: "
                + (java.time.temporal.ChronoUnit.DAYS.between(periodStart, periodEnd) + 1)
                + "\nTien pro-rate: "
                + proratedAmount;
    }

    private void seedBillingRulesFromRoomUtilities(Contract contract) {
        List<RoomUtility> roomUtilities = roomUtilityRepository
                .findActiveByRoomId(contract.getRoom().getId())
                .stream()
                .filter(roomUtility -> roomUtility.getUtility() != null)
                .filter(roomUtility -> roomUtility.getStartDate() == null
                        || !roomUtility
                                .getStartDate()
                                .isAfter(contract.getEndDate() == null ? LocalDate.MAX : contract.getEndDate()))
                .toList();

        for (RoomUtility roomUtility : roomUtilities) {
            ContractBillingRule billingRule = ContractBillingRule.builder()
                    .organization(contract.getOrganization())
                    .contract(contract)
                    .utility(roomUtility.getUtility())
                    .cycle(BillingCycle.MONTHLY)
                    .unitPrice(roomUtility.getUtility().getUnitPrice())
                    .calculationType(roomUtility.getUtility().getType())
                    .effectiveFrom(contract.getStartDate())
                    .effectiveTo(contract.getEndDate())
                    .isActive(true)
                    .note("Backfilled from room utility")
                    .build();
            contractBillingRuleRepository.save(billingRule);
        }
    }

    private void seedDepositLedgerFromLegacyContract(Contract contract) {
        if (contract.getDeposit() == null || contract.getDeposit().signum() <= 0) {
            return;
        }

        DepositTransaction depositTransaction = DepositTransaction.builder()
                .organization(contract.getOrganization())
                .contract(contract)
                .transactionType(DepositTransactionType.COLLECT)
                .amount(contract.getDeposit())
                .currency("VND")
                .referenceType(DepositReferenceType.MANUAL_ADJUSTMENT)
                .note("Backfilled from legacy contract deposit")
                .occurredAt(
                        contract.getDepositReceivedAt() == null
                                ? contract.getCreatedAt()
                                : contract.getDepositReceivedAt())
                .createdBy(SecurityUtils.getCurrentUser())
                .build();
        depositTransactionRepository.save(depositTransaction);
    }

    private void validateEffectiveDates(LocalDate effectiveFrom, LocalDate effectiveTo) {
        if (effectiveFrom == null) {
            throw new AppException(ErrorCode.CONTRACT_START_DATE_REQUIRED);
        }
        if (effectiveTo != null && effectiveTo.isBefore(effectiveFrom)) {
            throw new AppException(ErrorCode.CONTRACT_EFFECTIVE_DATE_INVALID);
        }
    }

    private String buildRevisionNote(String note, String prefix) {
        if (note == null || note.isBlank()) {
            return prefix;
        }
        return prefix + " | " + note;
    }

    private String appendNote(String currentNote, String extraNote) {
        if (extraNote == null || extraNote.isBlank()) {
            return currentNote;
        }
        if (currentNote == null || currentNote.isBlank()) {
            return extraNote;
        }
        return currentNote + " | " + extraNote;
    }

    private void bootstrapLegacyVersion(Contract contract, ContractRequest request, boolean financialTermsChanged) {
        ContractVersion latestVersion = contractVersionRepository
                .findTopByContractIdOrderByVersionNumberDesc(contract.getId())
                .orElse(null);

        if (latestVersion == null) {
            seedInitialVersion(contract, request);
            return;
        }

        if (!financialTermsChanged) {
            return;
        }

        ContractVersion nextVersion = ContractVersion.builder()
                .organization(contract.getOrganization())
                .contract(contract)
                .versionNumber(latestVersion.getVersionNumber() + 1)
                .price(request.getRentPrice())
                .depositAmount(request.getDeposit())
                .billingCycle(resolveBillingCycle(request.getPaymentCycleMonths()))
                .paymentCycleMonths(request.getPaymentCycleMonths())
                .monthlyPaymentDay(request.getMonthlyPaymentDay())
                .effectiveFrom(LocalDate.now())
                .effectiveTo(request.getEndDate())
                .note("Auto-generated version from contract update flow")
                .createdBy(SecurityUtils.getCurrentUser())
                .build();
        contractVersionRepository.save(nextVersion);
    }

    private boolean hasFinancialTermsChanged(Contract contract, ContractRequest request) {
        return !Objects.equals(contract.getDeposit(), request.getDeposit())
                || !Objects.equals(contract.getRentPrice(), request.getRentPrice())
                || !Objects.equals(contract.getPaymentCycleMonths(), request.getPaymentCycleMonths())
                || !Objects.equals(contract.getMonthlyPaymentDay(), request.getMonthlyPaymentDay())
                || !Objects.equals(contract.getStartDate(), request.getStartDate())
                || !Objects.equals(contract.getEndDate(), request.getEndDate());
    }

    private BillingCycle resolveBillingCycle(Integer paymentCycleMonths) {
        if (paymentCycleMonths == null || paymentCycleMonths <= 1) {
            return BillingCycle.MONTHLY;
        }
        return BillingCycle.MONTHLY;
    }

    private void recordStateTransition(
            Contract contract, ContractStatus fromStatus, ContractStatus toStatus, String reason) {
        ContractStateTransition transition = ContractStateTransition.builder()
                .organization(contract.getOrganization())
                .contract(contract)
                .fromState(mapLifecycleState(fromStatus))
                .toState(mapLifecycleState(toStatus))
                .reason(reason)
                .changedBy(SecurityUtils.getCurrentUser())
                .changedAt(new Date())
                .build();
        contractStateTransitionRepository.save(transition);
    }

    private ContractLifecycleState mapLifecycleState(ContractStatus status) {
        if (status == null) {
            return null;
        }

        return switch (status) {
            case PENDING -> ContractLifecycleState.PENDING;
            case ACTIVE -> ContractLifecycleState.ACTIVE;
            case EXPIRED -> ContractLifecycleState.TERMINATED;
            case CANCELLED -> ContractLifecycleState.TERMINATED;
        };
    }

    private void syncRoomOccupancyStatus(Room room) {
        if (Boolean.TRUE.equals(room.getIsDeleted())) {
            return;
        }

        boolean hasEffectiveActiveContract =
                contractRepository.existsEffectiveActiveContractByRoomId(room.getId(), LocalDate.now());

        if (hasEffectiveActiveContract && room.getStatus() == RoomStatus.AVAILABLE) {
            room.setStatus(RoomStatus.OCCUPIED);
            roomRepository.saveAndFlush(room);
            return;
        }

        if (!hasEffectiveActiveContract && room.getStatus() == RoomStatus.OCCUPIED) {
            room.setStatus(RoomStatus.AVAILABLE);
            roomRepository.saveAndFlush(room);
        }
    }

    private LocalDate toLocalDate(Date date) {
        return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
    }

    private Tenant resolveTenant(ContractRequest request, Integer ownerId) {
        if (request.getTenantId() != null) {
            Tenant tenant = tenantRepository
                    .findById(request.getTenantId())
                    .orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_FOUND));
            validateTenantAccess(tenant);
            return tenant;
        }

        ContractTenantRequest tenantRequest = request.getTenant();
        if (tenantRequest == null) {
            throw new AppException(ErrorCode.TENANT_NOT_FOUND);
        }

        resourceLimitService.validateCanCreateTenant(ownerId);

        if (userRepository.existsByEmail(tenantRequest.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        if (tenantRequest.getPassword() == null || tenantRequest.getPassword().isBlank()) {
            throw new AppException(ErrorCode.CONTRACT_TENANT_PASSWORD_REQUIRED);
        }

        User user = User.builder()
                .email(tenantRequest.getEmail())
                .userName(tenantRequest.getEmail())
                .fullName(tenantRequest.getFullName())
                .phoneNumber(tenantRequest.getPhoneNumber())
                .password(passwordEncoder.encode(tenantRequest.getPassword()))
                .originalPassword(tenantRequest.getPassword())
                .enabled(true)
                .accountNonExpired(true)
                .credentialsNonExpired(true)
                .accountNonLocked(true)
                .build();
        userRepository.save(user);

        User owner = userRepository.findById(ownerId).orElseThrow(() -> new AppException(ErrorCode.OWNER_NOT_FOUND));

        Tenant tenant = Tenant.builder()
                .user(user)
                .owner(owner)
                .identityNumber(tenantRequest.getIdentityNumber())
                .dateOfBirth(tenantRequest.getDateOfBirth())
                .occupation(tenantRequest.getOccupation())
                .note(tenantRequest.getNote())
                .build();
        return tenantRepository.save(tenant);
    }

    private Tenant resolveTenantForUpdate(Contract contract, ContractRequest request) {
        if (request.getTenantId() != null) {
            return tenantRepository
                    .findById(request.getTenantId())
                    .orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_FOUND));
        }

        ContractTenantRequest tenantRequest = request.getTenant();
        if (tenantRequest == null) {
            return contract.getTenant();
        }

        Tenant existingTenant = contract.getTenant();
        if (existingTenant == null || existingTenant.getUser() == null) {
            return resolveTenant(
                    request, contract.getRoom().getBoardingHouse().getOwner().getId());
        }

        User user = existingTenant.getUser();
        boolean emailChanged = !user.getEmail().equalsIgnoreCase(tenantRequest.getEmail());
        if (emailChanged && userRepository.existsByEmail(tenantRequest.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        user.setFullName(tenantRequest.getFullName());
        user.setPhoneNumber(tenantRequest.getPhoneNumber());
        user.setEmail(tenantRequest.getEmail());
        user.setUserName(tenantRequest.getEmail());

        if (tenantRequest.getPassword() != null && !tenantRequest.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(tenantRequest.getPassword()));
            user.setOriginalPassword(tenantRequest.getPassword());
        }
        userRepository.save(user);

        existingTenant.setIdentityNumber(tenantRequest.getIdentityNumber());
        existingTenant.setDateOfBirth(tenantRequest.getDateOfBirth());
        existingTenant.setOccupation(tenantRequest.getOccupation());
        existingTenant.setNote(tenantRequest.getNote());

        return tenantRepository.save(existingTenant);
    }

    private void syncRoomUtilities(Room room, ContractRequest request) {
        List<ContractUtilityRequest> requestedUtilities =
                request.getUtilities() == null ? List.of() : request.getUtilities();

        List<RoomUtility> existingUtilities = new ArrayList<>(roomUtilityRepository.findByRoomId(room.getId()));
        Set<Integer> requestedUtilityIds = new HashSet<>();

        for (ContractUtilityRequest utilityRequest : requestedUtilities) {
            Utility utility = resolveUtility(room.getBoardingHouse(), utilityRequest);
            requestedUtilityIds.add(utility.getId());

            RoomUtilityId roomUtilityId = new RoomUtilityId(room.getId(), utility.getId());
            RoomUtility roomUtility = existingUtilities.stream()
                    .filter(item -> item.getId().equals(roomUtilityId))
                    .findFirst()
                    .orElseGet(() -> RoomUtility.builder()
                            .id(roomUtilityId)
                            .room(room)
                            .utility(utility)
                            .build());

            roomUtility.setQuantity(resolveQuantity(utilityRequest));
            roomUtility.setUsageAmount(utilityRequest.getUsageAmount());
            roomUtility.setStartDate(request.getStartDate());
            roomUtility.setEndDate(request.getEndDate() == null ? null : request.getEndDate());
            roomUtility.setNote(utilityRequest.getNote());

            roomUtilityRepository.save(roomUtility);
        }

        for (RoomUtility existing : existingUtilities) {
            if (!requestedUtilityIds.contains(existing.getUtility().getId())) {
                roomUtilityRepository.delete(existing);
            }
        }
    }

    private Utility resolveUtility(BoardingHouse boardingHouse, ContractUtilityRequest utilityRequest) {
        if (utilityRequest.getUtilityId() != null) {
            Utility utility = utilityRepository
                    .findById(utilityRequest.getUtilityId())
                    .orElseThrow(() -> new AppException(ErrorCode.UTILITY_NOT_FOUND));
            Integer utilityBoardingHouseId = utility.getBoardingHouse() == null
                    ? null
                    : utility.getBoardingHouse().getId();
            if (utilityBoardingHouseId != null && !utilityBoardingHouseId.equals(boardingHouse.getId())) {
                throw new AppException(ErrorCode.ACCESS_DENIED);
            }
            utility.setName(utilityRequest.getName());
            utility.setType(ServiceType.valueOf(utilityRequest.getType()));
            utility.setUnitPrice(utilityRequest.getUnitPrice());
            utility.setUnit(utilityRequest.getUnit());
            utility.setIsActive(true);
            return utilityRepository.save(utility);
        }

        BoardingHouse managedBoardingHouse = boardingHouseRepository
                .findById(boardingHouse.getId())
                .orElseThrow(() -> new AppException(ErrorCode.BOARDING_HOUSE_NOT_FOUND));

        Utility utility = Utility.builder()
                .name(utilityRequest.getName())
                .description("Created with contract")
                .type(ServiceType.valueOf(utilityRequest.getType()))
                .unitPrice(utilityRequest.getUnitPrice())
                .unit(utilityRequest.getUnit())
                .isActive(true)
                .boardingHouse(managedBoardingHouse)
                .build();
        return utilityRepository.save(utility);
    }

    private Integer resolveQuantity(ContractUtilityRequest utilityRequest) {
        Integer quantity = utilityRequest.getQuantity();
        return quantity == null || quantity < 1 ? 1 : quantity;
    }

    private void validateContractAccess(Contract contract) {
        validateRoomAccess(contract.getRoom());
    }

    private void validateTenantAccess(Tenant tenant) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        if (!SecurityUtils.isAdmin()
                && (tenant.getOwner() == null || !tenant.getOwner().getId().equals(currentUser.getId()))) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
    }

    private ContractDetailResponse toDetailResponse(Contract contract) {
        Tenant tenant = contract.getTenant();
        User tenantUser = tenant == null ? null : tenant.getUser();
        List<DepositTransaction> depositTransactions =
                depositTransactionRepository.findByContractIdOrderByOccurredAtDesc(contract.getId());
        List<carevn.luv2code.ez_tro.entity.Bill> bills = billRepository.findByContractId(contract.getId());
        List<ContractUtilityDetailResponse> utilities = contract.getRoom().getRoomUtilities() == null
                ? List.of()
                : contract.getRoom().getRoomUtilities().stream()
                        .filter(roomUtility -> roomUtility.getStartDate() != null)
                        .filter(roomUtility -> roomUtility.getStartDate().equals(contract.getStartDate()))
                        .map(roomUtility -> ContractUtilityDetailResponse.builder()
                                .utilityId(roomUtility.getUtility().getId())
                                .name(roomUtility.getUtility().getName())
                                .type(roomUtility.getUtility().getType().name())
                                .unitPrice(roomUtility.getUtility().getUnitPrice())
                                .unit(roomUtility.getUtility().getUnit())
                                .quantity(roomUtility.getQuantity())
                                .usageAmount(roomUtility.getUsageAmount())
                                .note(roomUtility.getNote())
                                .build())
                        .toList();

        return ContractDetailResponse.builder()
                .id(contract.getId())
                .contractCode(contract.getContractCode())
                .roomId(contract.getRoom().getId())
                .roomNumber(contract.getRoom().getRoomNumber())
                .boardingHouseId(contract.getRoom().getBoardingHouse().getId())
                .boardingHouseName(contract.getRoom().getBoardingHouse().getName())
                .organizationId(
                        contract.getOrganization() == null
                                ? null
                                : contract.getOrganization().getId())
                .organizationName(
                        contract.getOrganization() == null
                                ? null
                                : contract.getOrganization().getName())
                .tenantId(tenant == null ? null : tenant.getId())
                .userId(tenantUser == null ? null : tenantUser.getId())
                .tenantFullName(tenantUser == null ? null : tenantUser.getFullName())
                .tenantPhoneNumber(tenantUser == null ? null : tenantUser.getPhoneNumber())
                .tenantEmail(tenantUser == null ? null : tenantUser.getEmail())
                .tenantIdentityNumber(tenant == null ? null : tenant.getIdentityNumber())
                .tenantDateOfBirth(tenant == null ? null : tenant.getDateOfBirth())
                .tenantOccupation(tenant == null ? null : tenant.getOccupation())
                .tenantNote(tenant == null ? null : tenant.getNote())
                .startDate(contract.getStartDate())
                .endDate(contract.getEndDate())
                .deposit(contract.getDeposit())
                .rentPrice(contract.getRentPrice())
                .status(contract.getStatus())
                .note(contract.getNote())
                .depositReceivedAt(contract.getDepositReceivedAt())
                .depositPaymentMethod(contract.getDepositPaymentMethod())
                .paymentCycleMonths(contract.getPaymentCycleMonths())
                .monthlyPaymentDay(contract.getMonthlyPaymentDay())
                .fileCount(
                        contract.getFiles() == null
                                ? 0
                                : (int) contract.getFiles().stream()
                                        .filter(file -> !Boolean.TRUE.equals(file.isDeleted()))
                                        .count())
                .createdAt(contract.getCreatedAt())
                .updatedAt(contract.getUpdatedAt())
                .utilities(utilities)
                .versions(contractVersionRepository.findByContractIdOrderByVersionNumberDesc(contract.getId()).stream()
                        .map(this::toVersionSummary)
                        .toList())
                .amendments(
                        contractAmendmentRepository.findByContractIdOrderByEffectiveFromDesc(contract.getId()).stream()
                                .map(this::toAmendmentSummary)
                                .toList())
                .billingRules(
                        contractBillingRuleRepository
                                .findByContractIdAndIsActiveTrueOrderByEffectiveFromDesc(contract.getId())
                                .stream()
                                .map(this::toBillingRuleSummary)
                                .toList())
                .depositTransactions(depositTransactions.stream()
                        .map(this::toDepositTransactionSummary)
                        .toList())
                .depositSummary(toDepositLedgerSummary(depositTransactions))
                .settlementPreview(toSettlementPreview(bills, depositTransactions))
                .stateTransitions(
                        contractStateTransitionRepository
                                .findByContractIdOrderByChangedAtDesc(contract.getId())
                                .stream()
                                .map(this::toStateTransitionSummary)
                                .toList())
                .build();
    }

    private ContractVersionSummaryResponse toVersionSummary(ContractVersion version) {
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

    private ContractStateTransitionResponse toStateTransitionSummary(ContractStateTransition transition) {
        return ContractStateTransitionResponse.builder()
                .id(transition.getId())
                .fromState(transition.getFromState())
                .toState(transition.getToState())
                .reason(transition.getReason())
                .changedBy(
                        transition.getChangedBy() == null
                                ? null
                                : transition.getChangedBy().getId())
                .changedByName(
                        transition.getChangedBy() == null
                                ? null
                                : transition.getChangedBy().getFullName())
                .changedAt(transition.getChangedAt())
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

    private ContractBillingRuleSummaryResponse toBillingRuleSummary(ContractBillingRule billingRule) {
        return ContractBillingRuleSummaryResponse.builder()
                .id(billingRule.getId())
                .utilityId(
                        billingRule.getUtility() == null
                                ? null
                                : billingRule.getUtility().getId())
                .utilityName(
                        billingRule.getUtility() == null
                                ? null
                                : billingRule.getUtility().getName())
                .cycle(billingRule.getCycle())
                .unitPrice(billingRule.getUnitPrice())
                .calculationType(billingRule.getCalculationType())
                .effectiveFrom(billingRule.getEffectiveFrom())
                .effectiveTo(billingRule.getEffectiveTo())
                .active(billingRule.getIsActive())
                .note(billingRule.getNote())
                .build();
    }

    private DepositTransactionSummaryResponse toDepositTransactionSummary(DepositTransaction transaction) {
        return DepositTransactionSummaryResponse.builder()
                .id(transaction.getId())
                .transactionType(transaction.getTransactionType())
                .amount(transaction.getAmount())
                .currency(transaction.getCurrency())
                .referenceType(transaction.getReferenceType())
                .referenceId(transaction.getReferenceId())
                .note(transaction.getNote())
                .createdBy(
                        transaction.getCreatedBy() == null
                                ? null
                                : transaction.getCreatedBy().getId())
                .createdByName(
                        transaction.getCreatedBy() == null
                                ? null
                                : transaction.getCreatedBy().getFullName())
                .occurredAt(transaction.getOccurredAt())
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    private DepositLedgerSummaryResponse toDepositLedgerSummary(List<DepositTransaction> transactions) {
        BigDecimal totalCollected = BigDecimal.ZERO;
        BigDecimal totalDeducted = BigDecimal.ZERO;
        BigDecimal totalRefunded = BigDecimal.ZERO;
        BigDecimal currentBalance = BigDecimal.ZERO;

        for (DepositTransaction transaction : transactions) {
            BigDecimal amount = transaction.getAmount() == null ? BigDecimal.ZERO : transaction.getAmount();
            switch (transaction.getTransactionType()) {
                case COLLECT, ADJUST_IN, TRANSFER_IN -> {
                    totalCollected = totalCollected.add(amount);
                    currentBalance = currentBalance.add(amount);
                }
                case REFUND -> {
                    totalRefunded = totalRefunded.add(amount);
                    currentBalance = currentBalance.subtract(amount);
                }
                case ADJUST_OUT, DEDUCT_FOR_DAMAGE, DEDUCT_FOR_UNPAID_INVOICE, TRANSFER_OUT -> {
                    totalDeducted = totalDeducted.add(amount);
                    currentBalance = currentBalance.subtract(amount);
                }
            }
        }

        return DepositLedgerSummaryResponse.builder()
                .totalCollected(totalCollected)
                .totalDeducted(totalDeducted)
                .totalRefunded(totalRefunded)
                .currentBalance(currentBalance)
                .build();
    }

    private ContractSettlementPreviewResponse toSettlementPreview(
            List<carevn.luv2code.ez_tro.entity.Bill> bills, List<DepositTransaction> transactions) {
        BigDecimal paidBillsTotal = BigDecimal.ZERO;
        BigDecimal unpaidBillsTotal = BigDecimal.ZERO;
        int openBillCount = 0;

        for (carevn.luv2code.ez_tro.entity.Bill bill : bills) {
            BigDecimal amount = bill.getAmount() == null ? BigDecimal.ZERO : bill.getAmount();
            if (bill.getStatus() == BillStatus.PAID) {
                paidBillsTotal = paidBillsTotal.add(amount);
            } else {
                unpaidBillsTotal = unpaidBillsTotal.add(amount);
                openBillCount++;
            }
        }

        BigDecimal depositBalance = toDepositLedgerSummary(transactions).getCurrentBalance();
        BigDecimal estimatedRefundAmount =
                depositBalance.subtract(unpaidBillsTotal).max(BigDecimal.ZERO);
        BigDecimal estimatedAdditionalCharge =
                unpaidBillsTotal.subtract(depositBalance).max(BigDecimal.ZERO);

        return ContractSettlementPreviewResponse.builder()
                .openBillCount(openBillCount)
                .paidBillsTotal(paidBillsTotal)
                .unpaidBillsTotal(unpaidBillsTotal)
                .depositBalance(depositBalance)
                .estimatedRefundAmount(estimatedRefundAmount)
                .estimatedAdditionalCharge(estimatedAdditionalCharge)
                .build();
    }

    private Organization resolveOrCreateOrganizationForOwner(BoardingHouse boardingHouse) {
        Integer ownerId = boardingHouse.getOwner() == null
                ? null
                : boardingHouse.getOwner().getId();
        if (ownerId == null) {
            return null;
        }

        return organizationRepository
                .findByOwnerId(ownerId)
                .orElseGet(() -> organizationRepository.save(Organization.builder()
                        .organizationCode("ORG-OWNER-" + ownerId)
                        .name("Organization " + ownerId)
                        .owner(boardingHouse.getOwner())
                        .status(OrganizationStatus.ACTIVE)
                        .description("Auto-generated organization for legacy owner migration")
                        .build()));
    }

    private void validateRoomAccess(Room room) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        if (!SecurityUtils.isAdmin()
                && !room.getBoardingHouse().getOwner().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
    }
}
