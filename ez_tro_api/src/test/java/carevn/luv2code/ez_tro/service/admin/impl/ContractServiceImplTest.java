package carevn.luv2code.ez_tro.service.admin.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import carevn.luv2code.ez_tro.configuration.RequestIdFilter;
import carevn.luv2code.ez_tro.dto.requests.ContractRenewRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractViolationRequest;
import carevn.luv2code.ez_tro.dto.response.ContractDetailResponse;
import carevn.luv2code.ez_tro.dto.response.ContractSnapshotResponse;
import carevn.luv2code.ez_tro.dto.response.ContractVersionSummaryResponse;
import carevn.luv2code.ez_tro.entity.BoardingHouse;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.ContractOperationLog;
import carevn.luv2code.ez_tro.entity.ContractStateTransition;
import carevn.luv2code.ez_tro.entity.ContractVersion;
import carevn.luv2code.ez_tro.entity.Organization;
import carevn.luv2code.ez_tro.entity.Room;
import carevn.luv2code.ez_tro.entity.Tenant;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.ContractLifecycleState;
import carevn.luv2code.ez_tro.enums.ContractOperationStatus;
import carevn.luv2code.ez_tro.enums.ContractOperationType;
import carevn.luv2code.ez_tro.enums.ContractStatus;
import carevn.luv2code.ez_tro.enums.OrganizationStatus;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.BillMapper;
import carevn.luv2code.ez_tro.mapper.ContractMapper;
import carevn.luv2code.ez_tro.repository.BillRepository;
import carevn.luv2code.ez_tro.repository.BoardingHouseRepository;
import carevn.luv2code.ez_tro.repository.ContractAmendmentRepository;
import carevn.luv2code.ez_tro.repository.ContractBillingRuleRepository;
import carevn.luv2code.ez_tro.repository.ContractOperationLogRepository;
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
import carevn.luv2code.ez_tro.service.admin.ContractSnapshotService;
import carevn.luv2code.ez_tro.service.admin.NotificationService;
import carevn.luv2code.ez_tro.util.RequestAuditUtils;

@ExtendWith(MockitoExtension.class)
class ContractServiceImplTest {

    @Mock
    private ContractRepository contractRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private TenantRepository tenantRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BillRepository billRepository;

    @Mock
    private UtilityRepository utilityRepository;

    @Mock
    private RoomUtilityRepository roomUtilityRepository;

    @Mock
    private BoardingHouseRepository boardingHouseRepository;

    @Mock
    private ContractVersionRepository contractVersionRepository;

    @Mock
    private ContractAmendmentRepository contractAmendmentRepository;

    @Mock
    private ContractBillingRuleRepository contractBillingRuleRepository;

    @Mock
    private ContractOperationLogRepository contractOperationLogRepository;

    @Mock
    private DepositTransactionRepository depositTransactionRepository;

    @Mock
    private ContractStateTransitionRepository contractStateTransitionRepository;

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private ContractMapper contractMapper;

    @Mock
    private BillMapper billMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ResourceLimitServiceImpl resourceLimitService;

    @Mock
    private ContractSnapshotService contractSnapshotService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ContractServiceImpl contractService;

    @Test
    void renew_shouldCreateNextVersionAndExtendContract() {
        User owner = createOwner();
        Contract contract = createContract(owner);
        ContractVersion latestVersion = ContractVersion.builder()
                .id(20)
                .contract(contract)
                .organization(contract.getOrganization())
                .versionNumber(2)
                .price(new BigDecimal("5000000"))
                .depositAmount(new BigDecimal("10000000"))
                .paymentCycleMonths(1)
                .monthlyPaymentDay(5)
                .effectiveFrom(LocalDate.of(2026, 3, 1))
                .effectiveTo(LocalDate.of(2026, 3, 31))
                .build();
        ContractStateTransition renewedTransition = ContractStateTransition.builder()
                .contract(contract)
                .toState(ContractLifecycleState.RENEWED)
                .changedAt(new Date())
                .build();
        ContractRenewRequest request = ContractRenewRequest.builder()
                .effectiveFrom(LocalDate.of(2026, 4, 1))
                .newEndDate(LocalDate.of(2026, 4, 30))
                .newRentPrice(new BigDecimal("5500000"))
                .newDepositAmount(new BigDecimal("11000000"))
                .paymentCycleMonths(1)
                .monthlyPaymentDay(6)
                .autoRenew(true)
                .note("Gia hạn thêm 1 tháng")
                .build();

        when(contractRepository.findById(contract.getId())).thenReturn(Optional.of(contract));
        when(contractVersionRepository.findTopByContractIdOrderByVersionNumberDesc(contract.getId()))
                .thenReturn(Optional.of(latestVersion));
        when(contractSnapshotService.getSnapshot(eq(contract.getId()), eq(contract.getEndDate())))
                .thenReturn(ContractSnapshotResponse.builder()
                        .currentVersion(ContractVersionSummaryResponse.builder()
                                .id(latestVersion.getId())
                                .build())
                        .build());
        when(contractVersionRepository.findById(latestVersion.getId())).thenReturn(Optional.of(latestVersion));
        when(contractVersionRepository.save(any(ContractVersion.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(contractRepository.saveAndFlush(any(Contract.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(contractStateTransitionRepository.save(any(ContractStateTransition.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(contractVersionRepository.findByContractIdOrderByVersionNumberDesc(contract.getId()))
                .thenReturn(List.of(
                        ContractVersion.builder()
                                .id(21)
                                .versionNumber(3)
                                .price(request.getNewRentPrice())
                                .depositAmount(request.getNewDepositAmount())
                                .effectiveFrom(request.getEffectiveFrom())
                                .effectiveTo(request.getNewEndDate())
                                .monthlyPaymentDay(request.getMonthlyPaymentDay())
                                .paymentCycleMonths(request.getPaymentCycleMonths())
                                .build(),
                        latestVersion));
        when(contractAmendmentRepository.findByContractIdOrderByEffectiveFromDesc(contract.getId()))
                .thenReturn(List.of());
        when(contractBillingRuleRepository.findByContractIdAndIsActiveTrueOrderByEffectiveFromDesc(contract.getId()))
                .thenReturn(List.of());
        when(depositTransactionRepository.findByContractIdOrderByOccurredAtDesc(contract.getId()))
                .thenReturn(List.of());
        when(billRepository.findByContractId(contract.getId())).thenReturn(List.of());
        when(contractStateTransitionRepository.findByContractIdOrderByChangedAtDesc(contract.getId()))
                .thenReturn(List.of(renewedTransition));

        authenticate(owner);
        try {
            ContractDetailResponse response = contractService.renew(contract.getId(), request);

            assertEquals(request.getNewEndDate(), contract.getEndDate());
            assertTrue(Boolean.TRUE.equals(contract.getAutoRenew()));
            assertEquals(ContractLifecycleState.RENEWED, response.getLatestLifecycleState());

            ArgumentCaptor<ContractVersion> versionCaptor = ArgumentCaptor.forClass(ContractVersion.class);
            verify(contractVersionRepository).save(versionCaptor.capture());
            ContractVersion savedRenewalVersion = versionCaptor.getAllValues().stream()
                    .filter(version -> Integer.valueOf(3).equals(version.getVersionNumber()))
                    .findFirst()
                    .orElseThrow();

            assertEquals(request.getEffectiveFrom(), savedRenewalVersion.getEffectiveFrom());
            assertEquals(request.getNewEndDate(), savedRenewalVersion.getEffectiveTo());
            assertEquals(request.getNewRentPrice(), savedRenewalVersion.getPrice());
            verify(notificationService)
                    .sendToUser(
                            eq(contract.getTenant().getUser().getId()), anyString(), anyString(), anyString(), any());
        } finally {
            clearAuthentication();
        }
    }

    @Test
    void markViolated_shouldAppendNoteAndRecordLifecycleTransition() {
        User owner = createOwner();
        Contract contract = createContract(owner);
        ContractStateTransition violatedTransition = ContractStateTransition.builder()
                .contract(contract)
                .toState(ContractLifecycleState.VIOLATED)
                .changedAt(new Date())
                .build();

        when(contractRepository.findById(contract.getId())).thenReturn(Optional.of(contract));
        when(contractRepository.saveAndFlush(any(Contract.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(contractStateTransitionRepository.save(any(ContractStateTransition.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(contractVersionRepository.findByContractIdOrderByVersionNumberDesc(contract.getId()))
                .thenReturn(List.of());
        when(contractAmendmentRepository.findByContractIdOrderByEffectiveFromDesc(contract.getId()))
                .thenReturn(List.of());
        when(contractBillingRuleRepository.findByContractIdAndIsActiveTrueOrderByEffectiveFromDesc(contract.getId()))
                .thenReturn(List.of());
        when(depositTransactionRepository.findByContractIdOrderByOccurredAtDesc(contract.getId()))
                .thenReturn(List.of());
        when(billRepository.findByContractId(contract.getId())).thenReturn(List.of());
        when(contractStateTransitionRepository.findByContractIdOrderByChangedAtDesc(contract.getId()))
                .thenReturn(List.of(), List.of(violatedTransition));

        authenticate(owner);
        try {
            ContractDetailResponse response = contractService.markViolated(
                    contract.getId(),
                    ContractViolationRequest.builder()
                            .reason("Không thanh toán đúng hạn")
                            .evidence("Biên bản nhắc lần 3")
                            .build());

            assertTrue(contract.getNote().contains("Không thanh toán đúng hạn"));
            assertEquals(ContractLifecycleState.VIOLATED, response.getLatestLifecycleState());
            verify(contractStateTransitionRepository).save(any(ContractStateTransition.class));
            verify(notificationService)
                    .sendToUser(
                            eq(contract.getTenant().getUser().getId()), anyString(), anyString(), anyString(), any());
        } finally {
            clearAuthentication();
        }
    }

    @Test
    void markViolated_shouldReplayDuplicateRequestWhenIdempotencyKeyMatches() {
        User owner = createOwner();
        Contract contract = createContract(owner);
        ContractStateTransition violatedTransition = ContractStateTransition.builder()
                .contract(contract)
                .toState(ContractLifecycleState.VIOLATED)
                .changedAt(new Date())
                .build();
        ContractOperationLog existingLog = ContractOperationLog.builder()
                .contract(contract)
                .operationType(ContractOperationType.MARK_VIOLATED)
                .idempotencyKey("violation-1")
                .status(ContractOperationStatus.COMPLETED)
                .requestId("req-violation-1")
                .build();

        when(contractRepository.findById(contract.getId())).thenReturn(Optional.of(contract));
        when(contractRepository.saveAndFlush(any(Contract.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(contractStateTransitionRepository.save(any(ContractStateTransition.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(contractOperationLogRepository.saveAndFlush(any(ContractOperationLog.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(contractOperationLogRepository.findByContractIdAndOperationTypeAndIdempotencyKey(
                        contract.getId(), ContractOperationType.MARK_VIOLATED, "violation-1"))
                .thenReturn(Optional.empty(), Optional.of(existingLog));
        when(contractOperationLogRepository.save(any(ContractOperationLog.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(contractVersionRepository.findByContractIdOrderByVersionNumberDesc(contract.getId()))
                .thenReturn(List.of());
        when(contractAmendmentRepository.findByContractIdOrderByEffectiveFromDesc(contract.getId()))
                .thenReturn(List.of());
        when(contractBillingRuleRepository.findByContractIdAndIsActiveTrueOrderByEffectiveFromDesc(contract.getId()))
                .thenReturn(List.of());
        when(depositTransactionRepository.findByContractIdOrderByOccurredAtDesc(contract.getId()))
                .thenReturn(List.of());
        when(billRepository.findByContractId(contract.getId())).thenReturn(List.of());
        when(contractStateTransitionRepository.findByContractIdOrderByChangedAtDesc(contract.getId()))
                .thenReturn(List.of(), List.of(violatedTransition), List.of(violatedTransition));

        authenticate(owner);
        bindRequest("violation-1", "req-violation-1");
        try {
            ContractViolationRequest request = ContractViolationRequest.builder()
                    .reason("Không thanh toán đúng hạn")
                    .evidence("Biên bản nhắc lần 3")
                    .build();

            ContractDetailResponse firstResponse = contractService.markViolated(contract.getId(), request);
            ContractDetailResponse secondResponse = contractService.markViolated(contract.getId(), request);

            assertEquals(ContractLifecycleState.VIOLATED, firstResponse.getLatestLifecycleState());
            assertEquals(ContractLifecycleState.VIOLATED, secondResponse.getLatestLifecycleState());
            verify(contractStateTransitionRepository, times(1)).save(any(ContractStateTransition.class));
            verify(contractOperationLogRepository, times(1)).save(any(ContractOperationLog.class));

            ArgumentCaptor<ContractOperationLog> logCaptor = ArgumentCaptor.forClass(ContractOperationLog.class);
            verify(contractOperationLogRepository).save(logCaptor.capture());
            assertEquals("violation-1", logCaptor.getValue().getIdempotencyKey());
            assertEquals("req-violation-1", logCaptor.getValue().getRequestId());
            verify(notificationService, times(1))
                    .sendToUser(
                            eq(contract.getTenant().getUser().getId()), anyString(), anyString(), anyString(), any());
        } finally {
            clearAuthentication();
        }
    }

    @Test
    void markViolated_shouldRejectWhenSameIdempotencyKeyIsStillProcessing() {
        User owner = createOwner();
        Contract contract = createContract(owner);
        ContractOperationLog processingLog = ContractOperationLog.builder()
                .contract(contract)
                .operationType(ContractOperationType.MARK_VIOLATED)
                .idempotencyKey("violation-processing")
                .status(ContractOperationStatus.PROCESSING)
                .requestId("req-processing")
                .build();

        when(contractRepository.findById(contract.getId())).thenReturn(Optional.of(contract));
        when(contractOperationLogRepository.findByContractIdAndOperationTypeAndIdempotencyKey(
                        contract.getId(), ContractOperationType.MARK_VIOLATED, "violation-processing"))
                .thenReturn(Optional.of(processingLog));

        authenticate(owner);
        bindRequest("violation-processing", "req-processing");
        try {
            AppException ex = assertThrows(
                    AppException.class,
                    () -> contractService.markViolated(
                            contract.getId(),
                            ContractViolationRequest.builder()
                                    .reason("Không thanh toán đúng hạn")
                                    .evidence("Biên bản nhắc lần 3")
                                    .build()));

            assertEquals(ErrorCode.CONTRACT_OPERATION_ALREADY_PROCESSING, ex.getErrorCode());
            verify(contractRepository, never()).saveAndFlush(any(Contract.class));
            verify(contractStateTransitionRepository, never()).save(any(ContractStateTransition.class));
        } finally {
            clearAuthentication();
        }
    }

    @Test
    void processAutoRenewals_shouldSkipAlreadyRenewedPeriods() {
        Contract contract = createContract(createOwner());
        contract.setAutoRenew(true);
        contract.setEndDate(LocalDate.of(2026, 3, 31));
        ContractVersion latestVersion = ContractVersion.builder()
                .id(30)
                .versionNumber(4)
                .effectiveFrom(LocalDate.of(2026, 4, 1))
                .effectiveTo(LocalDate.of(2026, 4, 30))
                .build();

        when(contractRepository.findByAutoRenewTrueAndEndDateLessThanEqualAndStatusIn(any(LocalDate.class), anySet()))
                .thenReturn(List.of(contract));
        when(contractVersionRepository.findTopByContractIdOrderByVersionNumberDesc(contract.getId()))
                .thenReturn(Optional.of(latestVersion));

        int renewed = contractService.processAutoRenewals(LocalDate.of(2026, 3, 31));

        assertEquals(0, renewed);
        verify(contractRepository, never()).saveAndFlush(any(Contract.class));
    }

    @Test
    void getBillsByContract_shouldRejectWhenOwnerDoesNotOwnContract() {
        User owner = createOwner();
        User anotherOwner = User.builder()
                .id(2)
                .userName("owner-2")
                .firstName("Other")
                .lastName("Owner")
                .build();
        Contract contract = createContract(owner);

        when(contractRepository.findById(contract.getId())).thenReturn(Optional.of(contract));

        authenticateOwner(anotherOwner);
        try {
            AppException ex =
                    assertThrows(AppException.class, () -> contractService.getBillsByContract(contract.getId()));
            assertEquals(ErrorCode.ACCESS_DENIED, ex.getErrorCode());
        } finally {
            clearAuthentication();
        }
    }

    @Test
    void terminate_shouldRejectCancelledContract() {
        User owner = createOwner();
        Contract contract = createContract(owner);
        contract.setStatus(ContractStatus.CANCELLED);

        when(contractRepository.findById(contract.getId())).thenReturn(Optional.of(contract));

        authenticate(owner);
        try {
            AppException ex = assertThrows(
                    AppException.class,
                    () -> contractService.terminate(
                            contract.getId(),
                            carevn.luv2code.ez_tro.dto.requests.ContractTerminateRequest.builder()
                                    .terminationDate(LocalDate.of(2026, 3, 15))
                                    .note("repeat terminate")
                                    .build()));
            assertEquals(ErrorCode.CONTRACT_LIFECYCLE_OPERATION_NOT_ALLOWED, ex.getErrorCode());
        } finally {
            clearAuthentication();
        }
    }

    private Contract createContract(User owner) {
        User tenantUser = User.builder()
                .id(22)
                .userName("tenant")
                .firstName("Tenant")
                .lastName("User")
                .build();
        Tenant tenant = Tenant.builder().id(12).owner(owner).user(tenantUser).build();
        Organization organization = Organization.builder()
                .id(5)
                .organizationCode("ORG-1")
                .name("Org 1")
                .owner(owner)
                .status(OrganizationStatus.ACTIVE)
                .build();
        BoardingHouse boardingHouse = new BoardingHouse();
        boardingHouse.setId(7);
        boardingHouse.setName("Khu trọ A");
        boardingHouse.setOwner(owner);
        boardingHouse.setOrganization(organization);
        boardingHouse.setAddress("123 Street");
        boardingHouse.setContactPhone("0123456789");
        Room room = Room.builder()
                .id(9)
                .roomNumber("101")
                .boardingHouse(boardingHouse)
                .build();

        return Contract.builder()
                .id(11)
                .contractCode("CTR-001")
                .room(room)
                .tenant(tenant)
                .organization(organization)
                .startDate(LocalDate.of(2026, 1, 1))
                .endDate(LocalDate.of(2026, 3, 31))
                .status(ContractStatus.ACTIVE)
                .rentPrice(new BigDecimal("5000000"))
                .deposit(new BigDecimal("10000000"))
                .paymentCycleMonths(1)
                .monthlyPaymentDay(5)
                .autoRenew(false)
                .build();
    }

    private User createOwner() {
        return User.builder()
                .id(1)
                .userName("owner")
                .firstName("Owner")
                .lastName("Admin")
                .build();
    }

    private void authenticate(User user) {
        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken(
                        user, null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));
    }

    private void authenticateOwner(User user) {
        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken(
                        user, null, List.of(new SimpleGrantedAuthority("ROLE_OWNER"))));
    }

    private void clearAuthentication() {
        SecurityContextHolder.clearContext();
        RequestContextHolder.resetRequestAttributes();
    }

    private void bindRequest(String idempotencyKey, String requestId) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(RequestAuditUtils.IDEMPOTENCY_KEY_HEADER, idempotencyKey);
        request.setAttribute(RequestIdFilter.REQUEST_ID_ATTRIBUTE, requestId);
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
    }
}
