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
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import carevn.luv2code.ez_tro.constants.AppConstants;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.Gson;

import carevn.luv2code.ez_tro.dto.requests.BillRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractAmendmentCreateRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractBillingRuleCreateRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractRenewRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractRoomTransferRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractTenantRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractTerminateRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractUtilityRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractViolationRequest;
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
import carevn.luv2code.ez_tro.dto.response.DepositTransactionSummaryResponse;
import carevn.luv2code.ez_tro.entity.Bill;
import carevn.luv2code.ez_tro.entity.BoardingHouse;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.ContractAmendment;
import carevn.luv2code.ez_tro.entity.ContractBillingRule;
import carevn.luv2code.ez_tro.entity.ContractOperationLog;
import carevn.luv2code.ez_tro.entity.ContractStateTransition;
import carevn.luv2code.ez_tro.entity.ContractVersion;
import carevn.luv2code.ez_tro.entity.DepositTransaction;
import carevn.luv2code.ez_tro.entity.Organization;
import carevn.luv2code.ez_tro.entity.Payment;
import carevn.luv2code.ez_tro.entity.PaymentAllocation;
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
import carevn.luv2code.ez_tro.repository.ContractOperationLogRepository;
import carevn.luv2code.ez_tro.repository.ContractRepository;
import carevn.luv2code.ez_tro.repository.ContractStateTransitionRepository;
import carevn.luv2code.ez_tro.repository.ContractVersionRepository;
import carevn.luv2code.ez_tro.repository.DepositTransactionRepository;
import carevn.luv2code.ez_tro.repository.OrganizationRepository;
import carevn.luv2code.ez_tro.repository.PaymentAllocationRepository;
import carevn.luv2code.ez_tro.repository.PaymentRepository;
import carevn.luv2code.ez_tro.repository.RoomRepository;
import carevn.luv2code.ez_tro.repository.RoomUtilityRepository;
import carevn.luv2code.ez_tro.repository.TenantRepository;
import carevn.luv2code.ez_tro.repository.UserRepository;
import carevn.luv2code.ez_tro.repository.UtilityRepository;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.ContractService;
import carevn.luv2code.ez_tro.service.admin.ContractSnapshotService;
import carevn.luv2code.ez_tro.service.admin.NotificationService;
import carevn.luv2code.ez_tro.service.admin.ObservabilityMetricsService;
import carevn.luv2code.ez_tro.service.admin.payment.InvoiceBalanceCalculator;
import carevn.luv2code.ez_tro.specification.ContractSpecs;
import carevn.luv2code.ez_tro.util.BillingKeyUtils;
import carevn.luv2code.ez_tro.util.DepositLedgerHelper;
import carevn.luv2code.ez_tro.util.RequestAuditUtils;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service xử lý nghiệp vụ Hợp đồng (Contract) cho admin/owner.
 *
 * <p>Mục tiêu của lớp này là gom các luồng "core" của contract domain vào một nơi:
 * tạo/cập nhật hợp đồng, versioning điều khoản, amendment/billing rule, deposit ledger,
 * và các thao tác vòng đời (renew/terminate/transfer/settlement/violation).
 *
 * <p>Lưu ý: file khá lớn vì đang đóng vai trò "compatibility layer" cho schema/flow cũ và flow mới.
 * Vì vậy comment chỉ tập trung vào các đoạn dễ gây hiểu nhầm (version timeline, idempotency, settlement/proration).
 */
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
    private final ContractOperationLogRepository contractOperationLogRepository;
    private final DepositTransactionRepository depositTransactionRepository;
    private final ContractStateTransitionRepository contractStateTransitionRepository;
    private final OrganizationRepository organizationRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentAllocationRepository paymentAllocationRepository;
    private final ContractMapper contractMapper;
    private final BillMapper billMapper;
    private final PasswordEncoder passwordEncoder;
    private final ResourceLimitServiceImpl resourceLimitService;
    private final ContractSnapshotService contractSnapshotService;
    private final NotificationService notificationService;
    private final ObservabilityMetricsService observabilityMetricsService;
    private final InvoiceBalanceCalculator invoiceBalanceCalculator;
    private final Gson gson = new Gson();

    /**
     * Tạo hợp đồng mới cho một phòng.
     *
     * <p>Business rules chính:
     * <ul>
     *   <li>Mỗi phòng chỉ có tối đa 1 hợp đồng đang hiệu lực/đang chờ (ACTIVE/PENDING).</li>
     *   <li>Ngày kết thúc (nếu có) phải >= ngày bắt đầu.</li>
     *   <li>Sau khi tạo root contract sẽ seed version v1 + ghi state transition để phục vụ audit/timeline.</li>
     * </ul>
     *
     * @param request thông tin tạo hợp đồng (roomId, tenantId/tenant, ngày hiệu lực, tiền thuê/cọc, kỳ thanh toán...)
     * @return DTO hợp đồng sau khi tạo
     */
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
        contract.setAutoRenew(Boolean.TRUE.equals(request.getAutoRenew()));

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
        observabilityMetricsService.incrementContractCreated(contract);

        notifyTenantLifecycleEvent(
                contract,
                "Hợp đồng mới đã được tạo",
                "Hợp đồng " + contract.getContractCode() + " đã được tạo cho phòng "
                        + (room.getRoomNumber() != null ? room.getRoomNumber() : "")
                        + ". Ngày bắt đầu: " + request.getStartDate()
                        + (request.getEndDate() != null ? (", ngày kết thúc: " + request.getEndDate()) : ""),
                "TENANT_CONTRACT_CREATED",
                new LinkedHashMap<>(Map.of(
                        "contractId", contract.getId(),
                        "contractCode", contract.getContractCode(),
                        "roomId", room.getId(),
                        "roomNumber", room.getRoomNumber(),
                        "tenantId", tenant.getId(),
                        "startDate",
                        request.getStartDate() != null
                                ? request.getStartDate().toString()
                                : null,
                        "endDate",
                        request.getEndDate() != null
                                ? request.getEndDate().toString()
                                : null)));

        notifyOwnerLifecycleEvent(
                contract,
                "Hợp đồng mới đã được tạo",
                "Admin đã tạo hợp đồng " + contract.getContractCode()
                        + " cho phòng " + (room.getRoomNumber() != null ? room.getRoomNumber() : "")
                        + ".",
                "OWNER_CONTRACT_CREATED",
                new LinkedHashMap<>(Map.of(
                        "contractId", contract.getId(),
                        "contractCode", contract.getContractCode(),
                        "roomId", room.getId(),
                        "roomNumber", room.getRoomNumber(),
                        "tenantId", tenant.getId(),
                        "startDate",
                        request.getStartDate() != null
                                ? request.getStartDate().toString()
                                : null,
                        "endDate",
                        request.getEndDate() != null
                                ? request.getEndDate().toString()
                                : null,
                        "dedupeKey", "owner-contract-created-" + contract.getId())));
        return contractMapper.toResponse(contract);
    }

    /**
     * Cập nhật hợp đồng theo id.
     *
     * <p>Giới hạn cập nhật:
     * <ul>
     *   <li>Không cho đổi phòng (roomId) hoặc đổi tenant (tenantId/tenant) qua API update (để tránh phá audit).</li>
     *   <li>Không cho update utilities trực tiếp trong update (utilities đi theo flow riêng).</li>
     * </ul>
     *
     * <p>Versioning:
     * Nếu các điều khoản tài chính thay đổi (giá thuê/cọc/kỳ thanh toán...) thì tạo {@link ContractVersion} mới
     * thay vì ghi đè lịch sử. Root contract vẫn được update để phản ánh "trạng thái hiện tại" phục vụ tương thích UI cũ.
     *
     * @param id      id hợp đồng cần cập nhật
     * @param request dữ liệu hợp đồng mới
     * @return DTO hợp đồng sau khi cập nhật
     */
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
        if (request.getAutoRenew() != null) {
            contract.setAutoRenew(request.getAutoRenew());
        }
        contract.setUpdatedAt(new Date());

        contractRepository.saveAndFlush(contract);
        bootstrapLegacyVersion(contract, request, financialTermsChanged);
        if (previousStatus != contract.getStatus()) {
            recordStateTransition(contract, previousStatus, contract.getStatus(), "CONTRACT_UPDATED");
        }
        syncRoomOccupancyStatus(contract.getRoom());
        return contractMapper.toResponse(contract);
    }

    /**
     * Xóa hợp đồng theo id.
     *
     * <p>Luồng này xóa record contract và đồng bộ lại trạng thái phòng (AVAILABLE/OCCUPIED) dựa trên
     * việc phòng còn hợp đồng hiệu lực hay không.
     *
     * @param id id hợp đồng cần xóa
     */
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

    /**
     * Lấy chi tiết hợp đồng theo id.
     *
     * @param id id hợp đồng
     * @return {@link ContractDetailResponse} (bao gồm các thành phần liên quan như version/rule/ledger tùy mapper)
     */
    @Override
    @Transactional(readOnly = true)
    public ContractDetailResponse getById(Integer id) {
        Contract contract =
                contractRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);
        return toDetailResponse(contract);
    }

    /**
     * Lấy danh sách hợp đồng đang active (lọc theo quyền).
     *
     * <p>Admin: xem tất cả. Owner: chỉ xem hợp đồng thuộc tài sản của mình.
     *
     * @return danh sách hợp đồng active
     */
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

    /**
     * Lấy danh sách tất cả hợp đồng (lọc theo quyền).
     *
     * @return danh sách hợp đồng
     */
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

    /**
     * Lấy danh sách hợp đồng phân trang (lọc theo quyền).
     *
     * @param page số trang (0-based)
     * @param size kích thước trang
     * @return page hợp đồng
     */
    @Override
    public Page<ContractResponse> getAllContractPaged(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        SecurityUtils.SpecificationSafeUser safe = SecurityUtils.safeUser();
        Specification<Contract> spec = Specification.where(null);

        if (!safe.isAdmin()) {
            spec = spec.and(ContractSpecs.ownedByOwner(safe.get()));
        }

        return contractRepository.findAll(spec, pageRequest).map(contractMapper::toResponse);
    }

    /**
     * Lấy danh sách hợp đồng theo phòng.
     *
     * @param roomId id phòng
     * @return danh sách hợp đồng thuộc phòng
     */
    @Override
    @Transactional(readOnly = true)
    public List<ContractResponse> getByRoom(Integer roomId) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        validateRoomAccess(room);
        return contractRepository.findByRoomId(roomId).stream()
                .map(contractMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách hợp đồng theo tenant.
     *
     * @param tenantId id tenant
     * @return danh sách hợp đồng thuộc tenant
     */
    @Override
    @Transactional(readOnly = true)
    public List<ContractResponse> getByTenant(Integer tenantId) {
        Tenant tenant =
                tenantRepository.findById(tenantId).orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_FOUND));
        validateTenantAccess(tenant);
        return contractRepository.findByTenantId(tenantId).stream()
                .map(contractMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách hóa đơn theo hợp đồng.
     *
     * @param contractId id hợp đồng
     * @return danh sách bill
     */
    @Override
    @Transactional(readOnly = true)
    public List<BillResponse> getBillsByContract(Integer contractId) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);
        return billRepository.findByContractId(contractId).stream()
                .map(billMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Tạo hóa đơn thủ công cho hợp đồng.
     *
     * <p>Chữ ký nhận {@code Object} để tương thích interface/flow legacy; thực tế mong đợi kiểu {@link BillRequest}.
     *
     * @param contractId     id hợp đồng
     * @param billRequestObj payload tạo bill (cast về {@link BillRequest})
     * @return bill vừa tạo
     */
    @Override
    @Transactional(readOnly = true)
    public BillResponse createBillForContract(Integer contractId, Object billRequestObj) {
        // API/Interface cũ truyền kiểu Object, nên cần cast về BillRequest ở đây.
        BillRequest billRequest = (BillRequest) billRequestObj;
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);

        // Map DTO -> Entity và gắn liên kết Contract để đảm bảo FK và truy vấn ngược.
        carevn.luv2code.ez_tro.entity.Bill bill = billMapper.toEntity(billRequest);
        bill.setContract(contract);
        bill.setCreatedAt(new Date());
        bill.setUpdatedAt(new Date());

        return billMapper.toResponse(billRepository.save(bill));
    }

    /**
     * Lọc hợp đồng theo nhiều tiêu chí và trả về dạng phân trang.
     *
     * <p>Điểm dễ nhầm:
     * <ul>
     *   <li>Search được áp vào nhiều field (contractCode / roomNumber / tên tenant).</li>
     *   <li>{@code startDate}/{@code endDate} được truyền dạng String và parse sang {@link LocalDate} (ISO).</li>
     * </ul>
     *
     * @param search          chuỗi tìm kiếm (có thể null)
     * @param startDate       ngày bắt đầu (yyyy-MM-dd)
     * @param endDate         ngày kết thúc (yyyy-MM-dd)
     * @param status          trạng thái hợp đồng (ALL để bỏ lọc)
     * @param boardingHouseId lọc theo nhà trọ
     * @param roomId          lọc theo phòng
     * @param page            số trang (0-based)
     * @param size            kích thước trang
     * @return page hợp đồng thỏa điều kiện
     */
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
                // Ghép firstName + lastName và xử lý null bằng coalesce để tránh lỗi khi tenant chưa gắn user đầy đủ.
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

        // Lọc theo nhà trọ (boarding house)
        if (boardingHouseId != null) {
            spec = spec.and((root, query, cb) -> {
                Join<Contract, Room> roomJoin = root.join("room", JoinType.LEFT);
                return cb.equal(roomJoin.get("boardingHouse").get("id"), boardingHouseId);
            });
        }

        // Lọc theo phòng (room)
        if (roomId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("room").get("id"), roomId));
        }

        Page<Contract> pageResult = contractRepository.findAll(spec, pageable);
        Page<ContractResponse> dtoPage = pageResult.map(contractMapper::toResponse);
        return dtoPage;
    }

    /**
     * Backfill dữ liệu nền (foundation) cho contract legacy.
     *
     * <p>Mục tiêu của hàm này là giúp dữ liệu cũ "khớp" với domain mới:
     * <ul>
     *   <li>Đảm bảo {@code organization} cho boardingHouse/contract.</li>
     *   <li>Seed {@link ContractVersion} nếu contract chưa có version.</li>
     *   <li>Seed state transition để có timeline/audit.</li>
     *   <li>Seed billing rules từ utilities của phòng.</li>
     *   <li>Seed deposit ledger (deposit transactions) từ dữ liệu deposit legacy.</li>
     * </ul>
     *
     * @return số lượng contract được duyệt xử lý (không nhất thiết tất cả đều thay đổi)
     */
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

    /**
     * Lấy version điều khoản đang hiệu lực tại một thời điểm.
     *
     * @param contractId id hợp đồng
     * @param asOfDate   ngày tra cứu (null -> mặc định "hôm nay")
     * @return version summary
     */
    @Override
    @Transactional(readOnly = true)
    public ContractVersionSummaryResponse getCurrentVersion(Integer contractId, LocalDate asOfDate) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);
        return contractSnapshotService.getCurrentVersion(contractId, asOfDate);
    }

    /**
     * Lấy snapshot hợp đồng tại một thời điểm (hợp đồng + version + rule + ledger...).
     *
     * @param contractId id hợp đồng
     * @param asOfDate   ngày tra cứu (null -> mặc định "hôm nay")
     * @return snapshot response
     */
    @Override
    @Transactional(readOnly = true)
    public ContractSnapshotResponse getSnapshot(Integer contractId, LocalDate asOfDate) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);
        return contractSnapshotService.getSnapshot(contractId, asOfDate);
    }

    /**
     * Tạo amendment (phụ lục/điều chỉnh) cho hợp đồng.
     *
     * <p>Ngoài việc lưu amendment, nếu request có các field override điều khoản (giá thuê/cọc/kỳ thanh toán...)
     * thì sẽ tự tạo {@link ContractVersion} mới để phản ánh thay đổi theo timeline.
     *
     * @param contractId id hợp đồng
     * @param request    payload amendment
     * @return amendment summary sau khi tạo
     */
    @Override
    @Transactional
    public ContractAmendmentSummaryResponse createAmendment(
            Integer contractId, ContractAmendmentCreateRequest request) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);
        validateEffectiveDates(request.getEffectiveFrom(), request.getEffectiveTo());
        validateEffectiveWithinContract(contract, request.getEffectiveFrom(), request.getEffectiveTo());
        validateAmendmentPayload(request);
        validateAmendmentConflicts(contractId, request, null);

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
        observabilityMetricsService.incrementAmendmentCreated(
                contract,
                request.getAmendmentType() != null ? request.getAmendmentType().name() : null);

        if (hasVersionOverride(request)) {
            createVersionFromAmendment(contract, request);
        }

        notifyTenantLifecycleEvent(
                contract,
                "Hợp đồng có phụ lục mới",
                "Hợp đồng " + contract.getContractCode()
                        + " vừa được cập nhật phụ lục ("
                        + (request.getAmendmentType() != null
                        ? request.getAmendmentType().name()
                        : "UNKNOWN")
                        + ")"
                        + (request.getEffectiveFrom() != null ? " từ ngày " + request.getEffectiveFrom() : "")
                        + (request.getEffectiveTo() != null ? " đến " + request.getEffectiveTo() : "")
                        + ".",
                "TENANT_CONTRACT_AMENDED",
                new LinkedHashMap<>(Map.of(
                        "contractId", contract.getId(),
                        "contractCode", contract.getContractCode(),
                        "amendmentId", savedAmendment.getId(),
                        "amendmentType",
                        request.getAmendmentType() != null
                                ? request.getAmendmentType().name()
                                : null,
                        "effectiveFrom",
                        request.getEffectiveFrom() != null
                                ? request.getEffectiveFrom().toString()
                                : null,
                        "effectiveTo",
                        request.getEffectiveTo() != null
                                ? request.getEffectiveTo().toString()
                                : null,
                        "note", request.getNote())));

        notifyOwnerLifecycleEvent(
                contract,
                "Hợp đồng có phụ lục mới",
                "Admin vừa cập nhật phụ lục cho hợp đồng " + contract.getContractCode() + ".",
                "OWNER_CONTRACT_AMENDED",
                new LinkedHashMap<>(Map.of(
                        "contractId",
                        contract.getId(),
                        "contractCode",
                        contract.getContractCode(),
                        "amendmentId",
                        savedAmendment.getId(),
                        "amendmentType",
                        request.getAmendmentType() != null
                                ? request.getAmendmentType().name()
                                : null,
                        "effectiveFrom",
                        request.getEffectiveFrom() != null
                                ? request.getEffectiveFrom().toString()
                                : null,
                        "effectiveTo",
                        request.getEffectiveTo() != null
                                ? request.getEffectiveTo().toString()
                                : null,
                        "dedupeKey",
                        "owner-contract-amended-" + savedAmendment.getId())));

        return toAmendmentSummary(savedAmendment);
    }

    /**
     * Revise một amendment hiện có bằng cách:
     * <ul>
     *   <li>Đóng amendment cũ (set effectiveTo = effectiveFrom mới - 1 ngày).</li>
     *   <li>Tạo amendment mới bắt đầu từ effectiveFrom mới.</li>
     * </ul>
     *
     * <p>Cách làm này giữ được lịch sử (không update đè).
     *
     * @param contractId  id hợp đồng
     * @param amendmentId id amendment cần revise
     * @param request     amendment mới (effectiveFrom phải > effectiveFrom cũ)
     * @return amendment summary của record mới tạo
     */
    @Override
    @Transactional
    public ContractAmendmentSummaryResponse reviseAmendment(
            Integer contractId, Integer amendmentId, ContractAmendmentCreateRequest request) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);
        validateEffectiveDates(request.getEffectiveFrom(), request.getEffectiveTo());
        validateEffectiveWithinContract(contract, request.getEffectiveFrom(), request.getEffectiveTo());
        validateAmendmentPayload(request);

        ContractAmendment existingAmendment = contractAmendmentRepository
                .findById(amendmentId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        if (!existingAmendment.getContract().getId().equals(contractId)) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        if (!request.getEffectiveFrom().isAfter(existingAmendment.getEffectiveFrom())) {
            throw new AppException(ErrorCode.CONTRACT_EFFECTIVE_DATE_INVALID);
        }

        // Đóng amendment cũ ngay trước ngày bắt đầu của amendment mới để không chồng lấn thời gian hiệu lực.
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

    /**
     * Tạo billing rule cho hợp đồng (quy tắc tính phí theo utility) theo khoảng thời gian hiệu lực.
     *
     * @param contractId id hợp đồng
     * @param request    payload billing rule
     * @return rule summary sau khi tạo
     */
    @Override
    @Transactional
    public ContractBillingRuleSummaryResponse createBillingRule(
            Integer contractId, ContractBillingRuleCreateRequest request) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);
        validateEffectiveDates(request.getEffectiveFrom(), request.getEffectiveTo());
        validateEffectiveWithinContract(contract, request.getEffectiveFrom(), request.getEffectiveTo());
        validateBillingRuleConflicts(contractId, request, null);

        Utility utility = utilityRepository
                .findById(request.getUtilityId())
                .orElseThrow(() -> new AppException(ErrorCode.UTILITY_NOT_FOUND));
        if (utility.getIsActive() != null && !utility.getIsActive()) {
            throw new AppException(ErrorCode.UTILITY_INACTIVE);
        }
        // Đảm bảo utility thuộc cùng boarding house với phòng của hợp đồng (tránh "lấy nhầm" utility nơi khác).
        if (!utilityAppliesToBoardingHouse(utility, contract.getRoom().getBoardingHouse())) {
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

    /**
     * Revise billing rule bằng cách deactivate rule cũ và tạo rule mới.
     *
     * @param contractId    id hợp đồng
     * @param billingRuleId id billing rule cần revise
     * @param request       payload rule mới (effectiveFrom phải > effectiveFrom của rule cũ)
     * @return rule summary của record mới tạo
     */
    @Override
    @Transactional
    public ContractBillingRuleSummaryResponse reviseBillingRule(
            Integer contractId, Integer billingRuleId, ContractBillingRuleCreateRequest request) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);
        validateEffectiveDates(request.getEffectiveFrom(), request.getEffectiveTo());
        validateEffectiveWithinContract(contract, request.getEffectiveFrom(), request.getEffectiveTo());

        ContractBillingRule existingRule = contractBillingRuleRepository
                .findById(billingRuleId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_BILLING_RULE_NOT_FOUND));
        if (!existingRule.getContract().getId().equals(contractId)) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        if (!request.getEffectiveFrom().isAfter(existingRule.getEffectiveFrom())) {
            throw new AppException(ErrorCode.CONTRACT_EFFECTIVE_DATE_INVALID);
        }

        // Tắt rule cũ và chốt effectiveTo để timeline không bị chồng lấn.
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

    /**
     * Deactivate billing rule (tắt hiệu lực).
     *
     * @param contractId    id hợp đồng
     * @param billingRuleId id billing rule
     * @return rule summary sau khi deactivate
     */
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

    /**
     * Tạo giao dịch sổ cọc (deposit ledger) cho hợp đồng.
     *
     * <p>Một số rule đáng chú ý:
     * <ul>
     *   <li>Số tiền phải > 0.</li>
     *   <li>Một số loại giao dịch yêu cầu reference (TRANSFER/DEDUCT...).</li>
     *   <li>Giao dịch trừ (debit) không được vượt quá số dư hiện tại.</li>
     * </ul>
     *
     * @param contractId id hợp đồng
     * @param request    payload giao dịch
     * @return giao dịch sau khi tạo
     */
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

        String referenceId = request.getReferenceId() == null
                ? null
                : request.getReferenceId().trim();
        String note = request.getNote() == null ? null : request.getNote().trim();

        if (request.getReferenceType() != null && (referenceId == null || referenceId.isBlank())) {
            throw new AppException(ErrorCode.DEPOSIT_TRANSACTION_REFERENCE_REQUIRED);
        }

        // Với giao dịch chuyển cọc, bắt buộc phải có reference (ví dụ: contractId đích/nguồn) để truy vết.
        if (request.getTransactionType() == DepositTransactionType.TRANSFER_IN
                || request.getTransactionType() == DepositTransactionType.TRANSFER_OUT) {
            if (request.getReferenceType() == null || referenceId == null || referenceId.isBlank()) {
                throw new AppException(ErrorCode.DEPOSIT_TRANSACTION_REFERENCE_REQUIRED);
            }
        }

        if (request.getTransactionType() == DepositTransactionType.DEDUCT_FOR_UNPAID_INVOICE
                && (referenceId == null || referenceId.isBlank())) {
            throw new AppException(ErrorCode.DEPOSIT_TRANSACTION_REFERENCE_REQUIRED);
        }

        if (isDepositDebitTransaction(request.getTransactionType())) {
            boolean hasReason = note != null && !note.isBlank();
            if (!hasReason && referenceId != null && !referenceId.isBlank()) {
                hasReason = true;
            }
            if (!hasReason) {
                throw new AppException(ErrorCode.DEPOSIT_TRANSACTION_REFERENCE_REQUIRED);
            }

            // Đảm bảo không bị trừ cọc âm: kiểm tra số dư hiện tại trước khi tạo giao dịch debit.
            List<DepositTransaction> validationHistory =
                    depositTransactionRepository.findByContractIdOrderByOccurredAtDesc(contractId);
            BigDecimal currentBalance =
                    DepositLedgerHelper.summarize(validationHistory).getCurrentBalance();
            if (currentBalance == null) {
                currentBalance = BigDecimal.ZERO;
            }
            if (request.getAmount().compareTo(currentBalance) > 0) {
                throw new AppException(ErrorCode.DEPOSIT_TRANSACTION_INSUFFICIENT_BALANCE);
            }
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
                .referenceId(referenceId)
                .note(note)
                .occurredAt(request.getOccurredAt())
                .createdBy(SecurityUtils.getCurrentUser())
                .build();
        return DepositLedgerHelper.toSummaryResponse(depositTransactionRepository.save(depositTransaction));
    }

    /**
     * Chốt quyết toán hợp đồng (settlement).
     *
     * <p>Luồng chính:
     * <ul>
     *   <li>Tính preview (tổng hóa đơn chưa trả, số dư cọc...).</li>
     *   <li>Nếu cọc không đủ để cover phần cần khấu trừ -> báo lỗi.</li>
     *   <li>Khấu trừ các hóa đơn mở bằng cọc (tạo transaction DEDUCT) và mark bill PAID.</li>
     *   <li>Hoàn cọc còn lại (REFUND) nếu có.</li>
     *   <li>Đóng hợp đồng (CANCELLED) và cập nhật endDate nếu cần.</li>
     * </ul>
     *
     * @param contractId id hợp đồng
     * @return chi tiết hợp đồng sau khi settlement
     */
    @Override
    @Transactional
    public ContractDetailResponse finalizeSettlement(Integer contractId) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);
        // Bọc idempotency để retry request (cùng Idempotency-Key) không tạo duplicate transaction/bill updates.
        return executeIdempotentDetailOperation(contract, ContractOperationType.FINALIZE_SETTLEMENT, () -> {
            ensureLifecycleActionAllowed(contract, "finalize-settlement");

            List<DepositTransaction> existingTransactions =
                    depositTransactionRepository.findByContractIdOrderByOccurredAtDesc(contractId);
            List<carevn.luv2code.ez_tro.entity.Bill> bills = billRepository.findByContractId(contractId).stream()
                    .filter(bill -> bill.getStatus() != BillStatus.CANCELLED)
                    .toList();
            ContractSettlementPreviewResponse settlementPreview = toSettlementPreview(bills, existingTransactions);

            // Tính tổng công nợ dựa trên outstanding thực tế (không dựa BillStatus).
            Map<Integer, BigDecimal> outstandingByBillId = new LinkedHashMap<>();
            BigDecimal outstandingTotal = BigDecimal.ZERO;
            for (carevn.luv2code.ez_tro.entity.Bill bill : bills) {
                BigDecimal outstanding =
                        nullToZero(invoiceBalanceCalculator.calculate(bill).getOutstandingAmount());
                outstandingByBillId.put(bill.getId(), outstanding);
                outstandingTotal = outstandingTotal.add(outstanding);
            }

            if (settlementPreview.getEstimatedAdditionalCharge().signum() > 0) {
                observabilityMetricsService.incrementSettlementMismatch(contract, "insufficient_deposit");
                throw new AppException(ErrorCode.CONTRACT_SETTLEMENT_INSUFFICIENT_DEPOSIT);
            }

            User currentUser = SecurityUtils.getCurrentUser();
            Date now = new Date();

            if (outstandingTotal.signum() > 0) {
                // Khấu trừ phần công nợ còn lại bằng tiền cọc (1 transaction tổng để đơn giản hóa audit).
                DepositTransaction deduction = DepositTransaction.builder()
                        .organization(contract.getOrganization())
                        .contract(contract)
                        .transactionType(DepositTransactionType.DEDUCT_FOR_UNPAID_INVOICE)
                        .amount(outstandingTotal)
                        .currency("VND")
                        .referenceType(DepositReferenceType.SETTLEMENT)
                        .note("Khau tru tien coc de tat toan hoa don mo")
                        .occurredAt(now)
                        .createdBy(currentUser)
                        .build();
                depositTransactionRepository.save(deduction);

                // Tạo payment để allocate vào các bill (đơn giản hóa flow, thay vì tạo allocation trực tiếp từ transaction).
                Payment settlementPayment = paymentRepository.save(Payment.builder()
                        .organization(contract.getOrganization())
                        .contract(contract)
                        .tenant(contract.getTenant())
                        .amount(outstandingTotal)
                        .currency("VND")
                        .externalReference(buildSettlementPaymentReference(contractId, now))
                        .source(PaymentSource.DEPOSIT)
                        .status(PaymentStatus.CONFIRMED)
                        .receivedAt(now)
                        .confirmedAt(now)
                        .note("Khau tru tien coc de tat toan hoa don mo")
                        .createdBy(currentUser)
                        .build());

                // Tạo allocation từ payment vào các bill dựa trên outstanding thực tế (có thể có bill đã mark PAID nhưng vẫn còn outstanding do lỗi trước đó).
                List<PaymentAllocation> settlementAllocations = new ArrayList<>();
                for (carevn.luv2code.ez_tro.entity.Bill bill : bills) {
                    BigDecimal outstanding = outstandingByBillId.getOrDefault(bill.getId(), BigDecimal.ZERO);
                    if (outstanding.signum() > 0) {
                        settlementAllocations.add(PaymentAllocation.builder()
                                .payment(settlementPayment)
                                .bill(bill)
                                .amount(outstanding)
                                .allocationType(PaymentAllocationType.ALLOCATE)
                                .note("Tat toan hoa don bang tien coc")
                                .createdBy(currentUser)
                                .build());
                        bill.setStatus(BillStatus.PAID);
                        bill.setPaymentDate(now);
                    }
                }
                if (!settlementAllocations.isEmpty()) {
                    paymentAllocationRepository.saveAll(settlementAllocations);
                    settlementPayment.setStatus(PaymentStatus.FULLY_ALLOCATED); // Cập nhật trạng thái payment nếu đã allocate hết vào bill.
                    paymentRepository.save(settlementPayment);
                }
                billRepository.saveAll(bills);
            }

            if (settlementPreview.getEstimatedRefundAmount().signum() > 0) {
                // Hoàn phần cọc còn dư (nếu có) sau khi đã khấu trừ các khoản cần thiết.
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

            // Đóng hợp đồng sau khi đã xử lý xong phần tài chính. Nếu endDate chưa có hoặc đang ở tương lai thì cập nhật về ngày hôm nay.
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
        });
    }

    /**
     * Chấm dứt hợp đồng theo ngày (terminate).
     *
     * <p>Có thể phát sinh bill prorate để chốt tiền thuê trong tháng (tính theo số ngày ở thực tế).
     * Việc quyết toán/hoàn cọc vẫn đi theo flow settlement riêng.
     *
     * @param contractId id hợp đồng
     * @param request    payload chấm dứt (terminationDate, note...)
     * @return chi tiết hợp đồng sau khi chấm dứt
     */
    @Override
    @Transactional
    public ContractDetailResponse terminate(Integer contractId, ContractTerminateRequest request) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);
        // Bọc idempotency: tránh tạo nhiều bill prorate / transition khi client retry.
        return executeIdempotentDetailOperation(contract, ContractOperationType.TERMINATE, () -> {
            ensureLifecycleActionAllowed(contract, "terminate");
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
            notifyTenantLifecycleEvent(
                    contract,
                    "Hợp đồng đã được chấm dứt",
                    "Hợp đồng " + contract.getContractCode() + " đã được chấm dứt vào ngày "
                            + request.getTerminationDate(),
                    "CONTRACT_TERMINATED",
                    Map.of(
                            "contractId", contract.getId(),
                            "contractCode", contract.getContractCode(),
                            "terminationDate", request.getTerminationDate().toString()));

            notifyOwnerLifecycleEvent(
                    contract,
                    "Hợp đồng đã được chấm dứt",
                    "Admin đã chấm dứt hợp đồng " + contract.getContractCode() + " vào ngày "
                            + request.getTerminationDate() + ".",
                    "OWNER_CONTRACT_TERMINATED",
                    Map.of(
                            "contractId", contract.getId(),
                            "contractCode", contract.getContractCode(),
                            "terminationDate", request.getTerminationDate().toString(),
                            "dedupeKey", "owner-contract-terminated-" + contract.getId()));
            syncRoomOccupancyStatus(contract.getRoom());
            return toDetailResponse(contract);
        });
    }

    /**
     * Gia hạn hợp đồng (renew).
     *
     * @param contractId id hợp đồng
     * @param request    payload gia hạn
     * @return chi tiết hợp đồng sau gia hạn
     */
    @Override
    @Transactional
    public ContractDetailResponse renew(Integer contractId, ContractRenewRequest request) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);
        // Dùng idempotency vì renew có thể tạo version/state transition và thay đổi ngày kết thúc.
        return executeIdempotentDetailOperation(
                contract, ContractOperationType.RENEW, () -> renewContract(contract, request, false));
    }

    /**
     * Đánh dấu hợp đồng vi phạm (violation).
     *
     * <p>Hàm này ghi nhận vào note + state transition để phục vụ audit/timeline và gửi thông báo cho tenant.
     *
     * @param contractId id hợp đồng
     * @param request    payload vi phạm (reason, evidence)
     * @return chi tiết hợp đồng sau khi đánh dấu
     */
    @Override
    @Transactional
    public ContractDetailResponse markViolated(Integer contractId, ContractViolationRequest request) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);
        // Idempotency để tránh "double log" nếu client retry.
        return executeIdempotentDetailOperation(contract, ContractOperationType.MARK_VIOLATED, () -> {
            if (contract.getStatus() == ContractStatus.CANCELLED || contract.getStatus() == ContractStatus.EXPIRED) {
                throw new AppException(ErrorCode.CONTRACT_LIFECYCLE_OPERATION_NOT_ALLOWED);
            }

            ContractLifecycleState fromState = resolveLatestLifecycleState(contract);
            if (fromState == ContractLifecycleState.VIOLATED) {
                throw new AppException(ErrorCode.CONTRACT_LIFECYCLE_OPERATION_NOT_ALLOWED);
            }

            String violationNote =
                    request.getEvidence() == null || request.getEvidence().isBlank()
                            ? "Vi phạm: " + request.getReason()
                            : "Vi phạm: " + request.getReason() + " | Bằng chứng: " + request.getEvidence();

            contract.setNote(appendNote(contract.getNote(), violationNote));
            contract.setUpdatedAt(new Date());
            contractRepository.saveAndFlush(contract);

            recordLifecycleTransition(
                    contract,
                    fromState,
                    ContractLifecycleState.VIOLATED,
                    "CONTRACT_MARKED_VIOLATED",
                    buildMetadataJson(Map.of(
                            "reason",
                            request.getReason(),
                            "evidence",
                            request.getEvidence() == null ? "" : request.getEvidence())));

            notifyTenantLifecycleEvent(
                    contract,
                    "Hợp đồng bị đánh dấu vi phạm",
                    "Hợp đồng " + contract.getContractCode() + " đã được đánh dấu vi phạm. Lý do: "
                            + request.getReason(),
                    "CONTRACT_VIOLATED",
                    Map.of(
                            "contractId", contract.getId(),
                            "contractCode", contract.getContractCode(),
                            "reason", request.getReason()));

            log.info("Contract {} marked violated by user {}", contract.getId(), SecurityUtils.getCurrentUserId());
            return toDetailResponse(contract);
        });
    }

    /**
     * Job xử lý auto-renew cho các hợp đồng bật {@code autoRenew=true}.
     *
     * <p>Thiết kế "best-effort": mỗi hợp đồng renew độc lập; hợp đồng nào lỗi thì log và bỏ qua để không chặn
     * cả batch.
     *
     * @param today ngày chạy job (null -> mặc định {@link LocalDate#now()})
     * @return số lượng hợp đồng renew thành công
     */
    @Override
    @Transactional
    public int processAutoRenewals(LocalDate today) {
        LocalDate operationDate = today == null ? LocalDate.now() : today;
        List<Contract> eligibleContracts = contractRepository.findByAutoRenewTrueAndEndDateLessThanEqualAndStatusIn(
                operationDate, Set.of(ContractStatus.ACTIVE, ContractStatus.EXPIRED));
        int renewedCount = 0;

        for (Contract contract : eligibleContracts) {
            try {
                ContractRenewRequest request = buildAutoRenewRequest(contract);
                if (request == null) {
                    continue;
                }
                renewContract(contract, request, true);
                renewedCount++;
            } catch (AppException ex) {
                log.warn(
                        "Skip auto renew for contract {}: {}",
                        contract.getId(),
                        ex.getErrorCode().getMessage());
            } catch (Exception ex) {
                log.error("Unexpected auto renew error for contract {}", contract.getId(), ex);
            }
        }

        return renewedCount;
    }

    @Override
    @Transactional
    public ContractDetailResponse updateAutoRenew(Integer contractId, boolean autoRenew) {
        Contract contract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(contract);

        Boolean current = contract.getAutoRenew();
        if (current == null || current.booleanValue() != autoRenew) {
            contract.setAutoRenew(autoRenew);
            contract.setUpdatedAt(new Date());
            contractRepository.saveAndFlush(contract);
        }
        return toDetailResponse(contract);
    }

    /**
     * Chuyển phòng cho tenant: kết thúc hợp đồng ở phòng cũ và tạo hợp đồng mới ở phòng đích.
     *
     * <p>Các điểm quan trọng:
     * <ul>
     *   <li>Không cho chuyển vào phòng đang có contract ACTIVE/PENDING.</li>
     *   <li>Có thể chuyển cọc (tạo TRANSFER_OUT/TRANSFER_IN) nếu không còn hóa đơn mở.</li>
     *   <li>Tạo bill prorate để tách kỳ tiền thuê trong tháng chuyển phòng.</li>
     * </ul>
     *
     * @param contractId id hợp đồng nguồn
     * @param request    payload chuyển phòng
     * @return thông tin hợp đồng mới tạo và số tiền cọc đã chuyển (nếu có)
     */
    @Override
    @Transactional
    public ContractRoomTransferResponse transferRoom(Integer contractId, ContractRoomTransferRequest request) {
        Contract sourceContract = contractRepository
                .findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        validateContractAccess(sourceContract);
        // Idempotency cho flow chuyển phòng vì có nhiều thao tác ghi (contract mới, bill prorate, deposit transfer...).
        return executeIdempotentTransferOperation(sourceContract, () -> {
            ensureLifecycleActionAllowed(sourceContract, "transfer-room");
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

            // Lấy version điều khoản đang hiệu lực tại ngày chuyển để dùng làm "mặc định" cho hợp đồng mới.
            ContractVersion effectiveVersion =
                    contractSnapshotService.resolveEffectiveVersionEntity(sourceContract, request.getTransferDate());
            List<DepositTransaction> sourceDepositTransactions =
                    depositTransactionRepository.findByContractIdOrderByOccurredAtDesc(sourceContract.getId());
            BigDecimal sourceDepositBalance =
                    DepositLedgerHelper.summarize(sourceDepositTransactions).getCurrentBalance();
            LocalDate originalEndDate = sourceContract.getEndDate();
            ContractSettlementPreviewResponse sourcePreview = toSettlementPreview(
                    billRepository.findByContractId(sourceContract.getId()), sourceDepositTransactions);

            boolean transferDeposit = Boolean.TRUE.equals(request.getTransferDeposit());
            if (transferDeposit && sourcePreview.getUnpaidBillsTotal().signum() > 0) {
                // Không cho chuyển cọc khi còn hóa đơn mở để tránh "mất cọc" ở hợp đồng cũ.
                throw new AppException(ErrorCode.CONTRACT_TRANSFER_OPEN_BILLS_NOT_ALLOWED);
            }

            BigDecimal nextRentPrice = request.getNewRentPrice() != null
                    ? request.getNewRentPrice()
                    : effectiveVersion == null ? sourceContract.getRentPrice() : effectiveVersion.getPrice();
            BigDecimal nextDepositAmount = request.getNewDepositAmount() != null
                    ? request.getNewDepositAmount()
                    : effectiveVersion == null ? sourceContract.getDeposit() : effectiveVersion.getDepositAmount();

            // Đóng hợp đồng nguồn tại ngày trước khi chuyển phòng.
            ContractStatus previousStatus = sourceContract.getStatus();
            sourceContract.setStatus(ContractStatus.CANCELLED);
            sourceContract.setEndDate(request.getTransferDate().minusDays(1));
            sourceContract.setNote(
                    appendNote(sourceContract.getNote(), "Chuyen phong sang " + targetRoom.getRoomNumber()));
            sourceContract.setUpdatedAt(new Date());
            contractRepository.saveAndFlush(sourceContract);
            recordStateTransition(sourceContract, previousStatus, sourceContract.getStatus(), "ROOM_TRANSFER_OUT");

            // Tạo hợp đồng mới cho phòng đích (giữ tenant, kế thừa điều khoản từ version tại ngày chuyển nếu cần).
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
            // Tạo bill prorate để tách tiền thuê tháng chuyển phòng (phòng cũ + phòng mới).
            createTransferProrationBills(sourceContract, targetContract, request.getTransferDate());

            BigDecimal transferredDepositAmount = BigDecimal.ZERO;
            if (transferDeposit && sourceDepositBalance.signum() > 0) {
                // Ghi nhận chuyển cọc theo dạng 2 giao dịch: out ở hợp đồng cũ và in ở hợp đồng mới.
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

            notifyTenantLifecycleEvent(
                    targetContract,
                    "Bạn đã được chuyển phòng",
                    "Bạn đã được chuyển từ phòng "
                            + (sourceContract.getRoom() != null
                            ? sourceContract.getRoom().getRoomNumber()
                            : "cũ")
                            + " sang phòng "
                            + (targetRoom.getRoomNumber() != null ? targetRoom.getRoomNumber() : "mới")
                            + " vào ngày " + request.getTransferDate()
                            + ".",
                    "TENANT_ROOM_CHANGED",
                    new LinkedHashMap<>(Map.of(
                            "contractId", targetContract.getId(),
                            "contractCode", targetContract.getContractCode(),
                            "sourceContractId", sourceContract.getId(),
                            "sourceContractCode", sourceContract.getContractCode(),
                            "transferDate",
                            request.getTransferDate() != null
                                    ? request.getTransferDate().toString()
                                    : null,
                            "targetRoomId", targetRoom.getId(),
                            "targetRoomNumber", targetRoom.getRoomNumber(),
                            "previousRoomId",
                            sourceContract.getRoom() != null
                                    ? sourceContract.getRoom().getId()
                                    : null,
                            "previousRoomNumber",
                            sourceContract.getRoom() != null
                                    ? sourceContract.getRoom().getRoomNumber()
                                    : null,
                            "transferredDepositAmount", transferredDepositAmount)));

            notifyOwnerLifecycleEvent(
                    targetContract,
                    "Đã chuyển phòng cho tenant",
                    "Admin đã chuyển tenant từ phòng "
                            + (sourceContract.getRoom() != null
                            ? sourceContract.getRoom().getRoomNumber()
                            : "cũ")
                            + " sang phòng " + (targetRoom.getRoomNumber() != null ? targetRoom.getRoomNumber() : "mới")
                            + " vào ngày " + request.getTransferDate() + ".",
                    "OWNER_CONTRACT_TRANSFERRED",
                    new LinkedHashMap<>(Map.of(
                            "contractId", targetContract.getId(),
                            "contractCode", targetContract.getContractCode(),
                            "sourceContractId", sourceContract.getId(),
                            "sourceContractCode", sourceContract.getContractCode(),
                            "transferDate",
                            request.getTransferDate() != null
                                    ? request.getTransferDate().toString()
                                    : null,
                            "targetRoomId", targetRoom.getId(),
                            "targetRoomNumber", targetRoom.getRoomNumber(),
                            "transferredDepositAmount", transferredDepositAmount,
                            "dedupeKey",
                            "owner-contract-transferred-" + sourceContract.getId() + "-" + targetRoom.getId()
                                    + "-" + request.getTransferDate())));

            return ContractRoomTransferResponse.builder()
                    .sourceContractId(sourceContract.getId())
                    .sourceContractCode(sourceContract.getContractCode())
                    .targetContractId(targetContract.getId())
                    .targetContractCode(targetContract.getContractCode())
                    .targetRoomId(targetRoom.getId())
                    .targetRoomNumber(targetRoom.getRoomNumber())
                    .transferredDepositAmount(transferredDepositAmount)
                    .build();
        });
    }

    private ContractDetailResponse renewContract(
            Contract contract, ContractRenewRequest request, boolean autoGenerated) {
        if (contract.getEndDate() == null) {
            throw new AppException(ErrorCode.CONTRACT_LIFECYCLE_OPERATION_NOT_ALLOWED);
        }

        LocalDate effectiveFrom = request.getEffectiveFrom();
        LocalDate currentEndDate = contract.getEndDate();
        if (!effectiveFrom.isAfter(currentEndDate)) {
            throw new AppException(ErrorCode.CONTRACT_RENEWAL_DATE_INVALID);
        }
        if (request.getNewEndDate() == null || request.getNewEndDate().isBefore(effectiveFrom)) {
            throw new AppException(ErrorCode.CONTRACT_EFFECTIVE_DATE_INVALID);
        }

        ContractVersion latestVersion = contractVersionRepository
                .findTopByContractIdOrderByVersionNumberDesc(contract.getId())
                .orElse(null);
        if (latestVersion != null
                && latestVersion.getEffectiveFrom() != null
                && !latestVersion.getEffectiveFrom().isBefore(effectiveFrom)) {
            throw new AppException(ErrorCode.CONTRACT_ALREADY_RENEWED_FOR_PERIOD);
        }

        ContractSnapshotResponse snapshot = contractSnapshotService.getSnapshot(contract.getId(), currentEndDate);
        ContractVersion effectiveVersion = snapshot.getCurrentVersion() == null
                ? latestVersion
                : contractVersionRepository
                .findById(snapshot.getCurrentVersion().getId())
                .orElse(latestVersion);

        BigDecimal nextRentPrice = request.getNewRentPrice() != null
                ? request.getNewRentPrice()
                : effectiveVersion == null ? contract.getRentPrice() : effectiveVersion.getPrice();
        BigDecimal nextDepositAmount = request.getNewDepositAmount() != null
                ? request.getNewDepositAmount()
                : effectiveVersion == null ? contract.getDeposit() : effectiveVersion.getDepositAmount();
        Integer nextPaymentCycleMonths = request.getPaymentCycleMonths() != null
                ? request.getPaymentCycleMonths()
                : effectiveVersion == null
                ? contract.getPaymentCycleMonths()
                : effectiveVersion.getPaymentCycleMonths();
        Integer nextMonthlyPaymentDay = request.getMonthlyPaymentDay() != null
                ? request.getMonthlyPaymentDay()
                : effectiveVersion == null ? contract.getMonthlyPaymentDay() : effectiveVersion.getMonthlyPaymentDay();

        if (latestVersion != null) {
            LocalDate previousEffectiveTo = effectiveFrom.minusDays(1);
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
                .price(nextRentPrice)
                .depositAmount(nextDepositAmount)
                .billingCycle(resolveBillingCycle(nextPaymentCycleMonths))
                .paymentCycleMonths(nextPaymentCycleMonths)
                .monthlyPaymentDay(nextMonthlyPaymentDay)
                .effectiveFrom(effectiveFrom)
                .effectiveTo(request.getNewEndDate())
                .note(autoGenerated ? "Auto-generated version from renewal job" : "Version created from manual renewal")
                .createdBy(SecurityUtils.getCurrentUser())
                .build();
        contractVersionRepository.save(nextVersion);
        observabilityMetricsService.incrementContractVersionChanged(
                contract, autoGenerated ? "auto_renew" : "manual_renew");

        ContractStatus previousStatus = contract.getStatus();
        contract.setEndDate(request.getNewEndDate());
        if (request.getAutoRenew() != null) {
            contract.setAutoRenew(request.getAutoRenew());
        }
        if (!effectiveFrom.isAfter(LocalDate.now())) {
            contract.setRentPrice(nextRentPrice);
            contract.setDeposit(nextDepositAmount);
            contract.setPaymentCycleMonths(nextPaymentCycleMonths);
            contract.setMonthlyPaymentDay(nextMonthlyPaymentDay);
        }
        if (request.getNote() != null && !request.getNote().isBlank()) {
            contract.setNote(
                    appendNote(contract.getNote(), (autoGenerated ? "Auto renew: " : "Renew: ") + request.getNote()));
        }
        contract.setStatus(resolveLifecycleStatus(previousStatus, contract.getStartDate(), contract.getEndDate()));
        contract.setUpdatedAt(new Date());
        contractRepository.saveAndFlush(contract);

        ContractLifecycleState fromState = mapLifecycleState(previousStatus);
        recordLifecycleTransition(
                contract,
                fromState,
                ContractLifecycleState.RENEWED,
                autoGenerated ? "CONTRACT_AUTO_RENEWED" : "CONTRACT_RENEWED",
                buildMetadataJson(buildRenewalMetadata(
                        effectiveFrom,
                        request.getNewEndDate(),
                        nextRentPrice,
                        nextDepositAmount,
                        nextPaymentCycleMonths,
                        nextMonthlyPaymentDay,
                        autoGenerated)));

        notifyTenantLifecycleEvent(
                contract,
                autoGenerated ? "Hợp đồng đã tự gia hạn" : "Hợp đồng đã được gia hạn",
                "Hợp đồng " + contract.getContractCode() + " đã được gia hạn đến ngày " + request.getNewEndDate(),
                autoGenerated ? "CONTRACT_AUTO_RENEWED" : "CONTRACT_RENEWED",
                Map.of(
                        "contractId", contract.getId(),
                        "contractCode", contract.getContractCode(),
                        "effectiveFrom", effectiveFrom.toString(),
                        "newEndDate", request.getNewEndDate().toString()));

        notifyOwnerLifecycleEvent(
                contract,
                autoGenerated ? "Hợp đồng đã tự gia hạn" : "Hợp đồng đã được gia hạn",
                "Admin đã gia hạn hợp đồng " + contract.getContractCode() + " đến ngày " + request.getNewEndDate()
                        + ".",
                "OWNER_CONTRACT_RENEWED",
                Map.of(
                        "contractId", contract.getId(),
                        "contractCode", contract.getContractCode(),
                        "effectiveFrom", effectiveFrom.toString(),
                        "newEndDate", request.getNewEndDate().toString(),
                        "dedupeKey", "owner-contract-renewed-" + contract.getId() + "-" + request.getNewEndDate()));

        syncRoomOccupancyStatus(contract.getRoom());
        log.info(
                "Contract {} renewed. autoGenerated={}, effectiveFrom={}, newEndDate={}",
                contract.getId(),
                autoGenerated,
                effectiveFrom,
                request.getNewEndDate());
        return toDetailResponse(contract);
    }

    private ContractRenewRequest buildAutoRenewRequest(Contract contract) {
        if (contract.getEndDate() == null) {
            return null;
        }

        ContractVersion latestVersion = contractVersionRepository
                .findTopByContractIdOrderByVersionNumberDesc(contract.getId())
                .orElse(null);

        LocalDate currentTermStart = latestVersion != null && latestVersion.getEffectiveFrom() != null
                ? latestVersion.getEffectiveFrom()
                : contract.getStartDate();
        LocalDate currentTermEnd = latestVersion != null && latestVersion.getEffectiveTo() != null
                ? latestVersion.getEffectiveTo()
                : contract.getEndDate();

        if (currentTermStart == null || currentTermEnd == null || currentTermEnd.isBefore(currentTermStart)) {
            throw new AppException(ErrorCode.CONTRACT_LIFECYCLE_OPERATION_NOT_ALLOWED);
        }

        long termDays = java.time.temporal.ChronoUnit.DAYS.between(currentTermStart, currentTermEnd) + 1L;
        if (termDays < 1) {
            termDays = 1;
        }

        LocalDate effectiveFrom = contract.getEndDate().plusDays(1);
        LocalDate newEndDate = effectiveFrom.plusDays(termDays - 1);

        return ContractRenewRequest.builder()
                .effectiveFrom(effectiveFrom)
                .newEndDate(newEndDate)
                .autoRenew(true)
                .note("Auto renewal generated from daily scheduler")
                .build();
    }

    /**
     * Tính trạng thái lifecycle dựa trên status request + ngày bắt đầu/kết thúc.
     * - Nếu request CANCELLED => trả về CANCELLED.
     * - Nếu startDate ở tương lai => PENDING.
     * - Nếu endDate đã qua => EXPIRED.
     * - Ngược lại => ACTIVE.
     */
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

    /**
     * Tạo version v1 cho hợp đồng mới tạo (giá, cọc, billing cycle...).
     * Chỉ chạy khi create contract, không dùng cho legacy import.
     */
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

    /**
     * Trường hợp migrate dữ liệu cũ: seed version dựa trên fields hiện tại của contract.
     */
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

    /**
     * Sinh {@link ContractVersion} từ amendment khi amendment có override các điều khoản tài chính.
     *
     * <p>Điểm khó hiểu thường gặp là "timeline":
     * <ul>
     *   <li>{@code effectiveFrom} lấy từ amendment.</li>
     *   <li>{@code effectiveTo} của version mới sẽ bị "cap" để không chồng lấn với version kế tiếp (nếu có).</li>
     *   <li>Version trước đó (nếu giao cắt) sẽ bị set {@code effectiveTo = effectiveFrom - 1} để tránh overlap.</li>
     * </ul>
     *
     * <p>Ngoài ra, để tương thích UI/flow cũ, nếu {@code effectiveFrom <= today} thì root contract
     * cũng được update các field (rent/deposit/payment terms).
     */
    private void createVersionFromAmendment(Contract contract, ContractAmendmentCreateRequest request) {
        ContractVersion latestVersion = contractVersionRepository
                .findTopByContractIdOrderByVersionNumberDesc(contract.getId())
                .orElse(null);

        LocalDate effectiveFrom = request.getEffectiveFrom();
        // Tìm version "liền kề" theo ngày hiệu lực để giới hạn effectiveTo và xử lý đóng version trước.
        VersionNeighbors neighbors = resolveVersionNeighbors(contract.getId(), effectiveFrom);
        LocalDate requiredEffectiveTo = neighbors.nextEffectiveFrom() != null
                ? neighbors.nextEffectiveFrom().minusDays(1)
                : contract.getEndDate();

        if (request.getEffectiveTo() != null) {
            if (requiredEffectiveTo == null) {
                throw new AppException(ErrorCode.CONTRACT_EFFECTIVE_DATE_INVALID);
            }
            // Nếu client truyền effectiveTo, phải đảm bảo không "ngắn" hơn mức tối thiểu để không chồng lên version kế
            // tiếp.
            if (request.getEffectiveTo().isBefore(requiredEffectiveTo)) {
                throw new AppException(ErrorCode.CONTRACT_EFFECTIVE_DATE_INVALID);
            }
        }

        LocalDate effectiveTo;
        if (requiredEffectiveTo == null) {
            effectiveTo = null;
        } else if (request.getEffectiveTo() == null || request.getEffectiveTo().isAfter(requiredEffectiveTo)) {
            effectiveTo = requiredEffectiveTo;
        } else {
            effectiveTo = request.getEffectiveTo();
        }

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

        // Đóng version trước (nếu có) ngay trước effectiveFrom để timeline version không overlap.
        if (neighbors.previousVersion() != null
                && neighbors.previousVersion().getEffectiveFrom() != null
                && effectiveFrom.isAfter(neighbors.previousVersion().getEffectiveFrom())) {
            LocalDate previousEffectiveTo = effectiveFrom.minusDays(1);
            if (neighbors.previousVersion().getEffectiveTo() == null
                    || neighbors.previousVersion().getEffectiveTo().isAfter(previousEffectiveTo)) {
                neighbors.previousVersion().setEffectiveTo(previousEffectiveTo);
                contractVersionRepository.save(neighbors.previousVersion());
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
                .effectiveFrom(effectiveFrom)
                .effectiveTo(effectiveTo)
                .note("Auto-generated version from amendment")
                .createdBy(SecurityUtils.getCurrentUser())
                .build();
        contractVersionRepository.save(nextVersion);
        observabilityMetricsService.incrementContractVersionChanged(contract, "amendment");

        // Nếu version mới đã/đang có hiệu lực, cập nhật root contract để UI cũ đọc "giá hiện tại".
        if (!effectiveFrom.isAfter(LocalDate.now())) {
            contract.setRentPrice(nextPrice);
            contract.setDeposit(nextDeposit);
            contract.setPaymentCycleMonths(nextPaymentCycleMonths);
            contract.setMonthlyPaymentDay(nextMonthlyPaymentDay);
            contractRepository.save(contract);
        }
    }

    /**
     * Tạo version khởi tạo cho hợp đồng phòng đích khi chuyển phòng.
     *
     * <p>Giữ nguyên điều khoản từ version đang hiệu lực của hợp đồng nguồn (nếu có)
     * và cập nhật giá/cọc theo payload chuyển phòng.
     */
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
                .depositAmount(nextDepositAmount) // Thông thường khi chuyển phòng sẽ không đổi cọc, nhưng vẫn cho phép override nếu có nhu cầu.
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

    /** Tạo hóa đơn prorate cho tháng chấm dứt hợp đồng (nếu kỳ bị cắt ngắn). */
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

    /** Khi chuyển phòng: tạo hóa đơn tính theo tỷ lệ (prorate) cho cả phòng cũ và phòng mới trong tháng chuyển. */
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

    /** Helper tạo bill prorate nếu chưa có bill trong tháng và kỳ bị rút ngắn. */
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

        LocalDate monthStart = dueDate.withDayOfMonth(1);
        LocalDate monthEnd = dueDate.withDayOfMonth(dueDate.lengthOfMonth());
        // Dùng generationKey để đảm bảo idempotent: cùng contract + cùng tháng + cùng loại invoice chỉ có 1 bill được
        // tạo. Với proration, dùng InvoiceType.PRORATION để tránh ghi đè bill RENT tháng.
        String generationKey = BillingKeyUtils.buildGenerationKey(
                contract.getOrganization() == null
                        ? null
                        : contract.getOrganization().getId(),
                contract.getId(),
                monthStart,
                monthEnd,
                InvoiceType.PRORATION);

        // Lấy snapshot tại periodStart để lấy đúng "giá thuê đang hiệu lực" (hỗ trợ contract versioning).
        ContractSnapshotResponse snapshot = contractSnapshotService.getSnapshot(contract.getId(), periodStart);
        BigDecimal monthlyPrice = snapshot.getCurrentVersion() != null
                && snapshot.getCurrentVersion().getPrice() != null
                ? snapshot.getCurrentVersion().getPrice()
                : contract.getRentPrice();
        BigDecimal proratedAmount = calculateProratedRent(monthlyPrice, periodStart, periodEnd);
        if (proratedAmount.signum() <= 0) {
            return;
        }

        Bill bill = billRepository.findByGenerationKey(generationKey).orElse(null);
        // Nếu bill đã PAID thì không đụng vào để tránh làm sai lịch sử thanh toán.
        if (bill != null && bill.getStatus() == BillStatus.PAID) {
            return;
        }

        if (bill == null) {
            bill = Bill.builder()
                    .billTitle(title)
                    .billCode(AppConstants.BILL_CODE_PREFIX + new SimpleDateFormat(CODE_TIMESTAMP_FORMAT).format(new Date()))
                    .contract(contract)
                    .room(contract.getRoom())
                    .tenant(contract.getTenant())
                    .amount(proratedAmount)
                    .billingPeriodStart(monthStart)
                    .billingPeriodEnd(monthEnd)
                    .generationKey(generationKey)
                    .invoiceType(InvoiceType.PRORATION)
                    .dueDate(dueDate)
                    .serviceAmount(BigDecimal.ZERO)
                    .status(BillStatus.UNPAID)
                    .note(buildProrationNote(notePrefix, monthlyPrice, periodStart, periodEnd, proratedAmount))
                    .createdAt(new Date())
                    .build();
        } else {
            // Nếu đã có bill (chưa paid), cập nhật lại amount/note theo period mới để phản ánh đúng prorate.
            bill.setBillTitle(title);
            bill.setAmount(proratedAmount);
            bill.setBillingPeriodStart(monthStart);
            bill.setBillingPeriodEnd(monthEnd);
            bill.setDueDate(dueDate);
            bill.setInvoiceType(InvoiceType.PRORATION);
            bill.setNote(buildProrationNote(notePrefix, monthlyPrice, periodStart, periodEnd, proratedAmount));
            bill.setStatus(bill.getStatus() == null ? BillStatus.UNPAID : bill.getStatus());
            bill.setUpdatedAt(new Date());
        }

        billRepository.save(bill);
    }

    /** Tính tiền thuê prorate theo số ngày sử dụng trong tháng (làm tròn 2 chữ số). */
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

    /** Kiểm tra trong tháng của dueDate đã tồn tại bill nào của contract hay chưa. */
    private boolean hasAnyBillInMonth(Integer contractId, LocalDate dueDate) {
        return billRepository.findByContractId(contractId).stream()
                .anyMatch(bill -> bill.getDueDate() != null
                        && YearMonth.from(bill.getDueDate()).equals(YearMonth.from(dueDate)));
    }

    /** Build nội dung ghi chú chi tiết cách tính prorate. */
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

    /** Sinh reference string duy nhất cho payment settlement từ cọc. */
    private String buildSettlementPaymentReference(Integer contractId, Date occurredAt) {
        String timestamp =
                new SimpleDateFormat("yyyyMMddHHmmssSSS").format(occurredAt != null ? occurredAt : new Date());
        return "SETTLEMENT-DEPOSIT-" + contractId + "-" + timestamp;
    }

    /** Import utility của phòng thành billing rule mặc định cho contract (case migrate). */
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

    /** Import số tiền cọc từ hợp đồng legacy thành transaction COLLECT. */
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

    /** Validate ngày hiệu lực từ/đến (to phải >= from, from bắt buộc). */
    private void validateEffectiveDates(LocalDate effectiveFrom, LocalDate effectiveTo) {
        if (effectiveFrom == null) {
            throw new AppException(ErrorCode.CONTRACT_START_DATE_REQUIRED);
        }
        if (effectiveTo != null && effectiveTo.isBefore(effectiveFrom)) {
            throw new AppException(ErrorCode.CONTRACT_EFFECTIVE_DATE_INVALID);
        }
    }

    /** Đảm bảo khoảng hiệu lực nằm trong khoảng hợp đồng gốc. */
    private void validateEffectiveWithinContract(Contract contract, LocalDate effectiveFrom, LocalDate effectiveTo) {
        if (contract == null || effectiveFrom == null) {
            return;
        }

        LocalDate contractStart = contract.getStartDate();
        LocalDate contractEnd = contract.getEndDate();

        if (contractStart != null && effectiveFrom.isBefore(contractStart)) {
            throw new AppException(ErrorCode.CONTRACT_EFFECTIVE_OUT_OF_RANGE);
        }

        if (contractEnd != null) {
            if (effectiveFrom.isAfter(contractEnd)) {
                throw new AppException(ErrorCode.CONTRACT_EFFECTIVE_OUT_OF_RANGE);
            }
            if (effectiveTo != null && effectiveTo.isAfter(contractEnd)) {
                throw new AppException(ErrorCode.CONTRACT_EFFECTIVE_OUT_OF_RANGE);
            }
        }
    }

    /** Validate payload amendment theo type (price/payment term/dataJson). */
    private void validateAmendmentPayload(ContractAmendmentCreateRequest request) {
        if (request == null || request.getAmendmentType() == null) {
            return;
        }

        String dataJson = request.getDataJson();
        if (dataJson != null && !dataJson.isBlank()) {
            try {
                gson.fromJson(dataJson, Object.class);
            } catch (Exception ex) {
                throw new AppException(ErrorCode.CONTRACT_AMENDMENT_DATA_INVALID);
            }
        }

        // Tùy loại amendment mà validate khác nhau:
        // - Một số loại dùng field typed (price/payment terms)
        // - Một số loại dùng dataJson (tùy biến)
        switch (request.getAmendmentType()) {
            case PRICE_CHANGE -> {
                if (request.getPrice() == null) {
                    throw new AppException(ErrorCode.CONTRACT_AMENDMENT_DATA_INVALID);
                }
            }
            case PAYMENT_TERM_CHANGE -> {
                if (request.getPaymentCycleMonths() == null && request.getMonthlyPaymentDay() == null) {
                    throw new AppException(ErrorCode.CONTRACT_AMENDMENT_DATA_INVALID);
                }
            }
            default -> {
                if (dataJson == null || dataJson.isBlank()) {
                    throw new AppException(ErrorCode.CONTRACT_AMENDMENT_DATA_INVALID);
                }
            }
        }
    }

    /** Chặn amendment cùng loại bị chồng lấn hiệu lực với amendment khác. */
    private void validateAmendmentConflicts(
            Integer contractId, ContractAmendmentCreateRequest request, Integer ignoreAmendmentId) {
        if (contractId == null || request == null || request.getAmendmentType() == null) {
            return;
        }

        List<ContractAmendment> existing =
                contractAmendmentRepository.findByContractIdOrderByEffectiveFromDesc(contractId);
        for (ContractAmendment amendment : existing) {
            if (amendment == null) {
                continue;
            }
            if (ignoreAmendmentId != null && ignoreAmendmentId.equals(amendment.getId())) {
                continue;
            }
            if (amendment.getAmendmentType() != request.getAmendmentType()) {
                continue;
            }
            if (datesOverlap(
                    amendment.getEffectiveFrom(),
                    amendment.getEffectiveTo(),
                    request.getEffectiveFrom(),
                    request.getEffectiveTo())) {
                throw new AppException(ErrorCode.CONTRACT_AMENDMENT_CONFLICT);
            }
        }
    }

    /** Chặn billing rule cùng utility bị overlap khoảng hiệu lực. */
    private void validateBillingRuleConflicts(
            Integer contractId, ContractBillingRuleCreateRequest request, Integer ignoreBillingRuleId) {
        if (contractId == null || request == null || request.getUtilityId() == null) {
            return;
        }

        List<ContractBillingRule> rules =
                contractBillingRuleRepository.findByContractIdAndIsActiveTrueOrderByEffectiveFromDesc(contractId);
        for (ContractBillingRule rule : rules) {
            if (rule == null) {
                continue;
            }
            if (ignoreBillingRuleId != null && ignoreBillingRuleId.equals(rule.getId())) {
                continue;
            }
            if (rule.getUtility() == null || rule.getUtility().getId() == null) {
                continue;
            }
            if (!request.getUtilityId().equals(rule.getUtility().getId())) {
                continue;
            }
            if (datesOverlap(
                    rule.getEffectiveFrom(),
                    rule.getEffectiveTo(),
                    request.getEffectiveFrom(),
                    request.getEffectiveTo())) {
                throw new AppException(ErrorCode.CONTRACT_BILLING_RULE_CONFLICT);
            }
        }
    }

    /** Kiểm tra hai khoảng ngày có giao nhau (cho phép open-ended bằng null). */
    private boolean datesOverlap(LocalDate fromA, LocalDate toA, LocalDate fromB, LocalDate toB) {
        if (fromA == null || fromB == null) {
            return false;
        }

        boolean aEndsAfterBStarts = toA == null || !toA.isBefore(fromB);
        boolean bEndsAfterAStarts = toB == null || !toB.isBefore(fromA);
        return aEndsAfterBStarts && bEndsAfterAStarts;
    }

    /** Xác định transaction cọc có phải chiều trừ (debit) để enforce số dư và yêu cầu lý do. */
    private boolean isDepositDebitTransaction(DepositTransactionType transactionType) {
        if (transactionType == null) {
            return false;
        }

        return switch (transactionType) {
            case REFUND, ADJUST_OUT, DEDUCT_FOR_DAMAGE, DEDUCT_FOR_UNPAID_INVOICE, TRANSFER_OUT -> true;
            default -> false;
        };
    }

    /**
     * Tìm version liền kề trước/sau theo effectiveFrom để set effectiveTo tránh overlap.
     */
    private VersionNeighbors resolveVersionNeighbors(Integer contractId, LocalDate effectiveFrom) {
        if (contractId == null || effectiveFrom == null) {
            return new VersionNeighbors(null, null);
        }

        ContractVersion previousVersion = null;
        LocalDate nextEffectiveFrom = null;

        // Duyệt danh sách version để tìm:
        // - previousVersion: version có effectiveFrom gần nhất nhưng < effectiveFrom mới
        // - nextEffectiveFrom: ngày bắt đầu sớm nhất nhưng > effectiveFrom mới
        for (ContractVersion version : contractVersionRepository.findByContractIdOrderByVersionNumberDesc(contractId)) {
            if (version == null || version.getEffectiveFrom() == null) {
                continue;
            }

            LocalDate versionFrom = version.getEffectiveFrom();
            if (versionFrom.isBefore(effectiveFrom)) {
                if (previousVersion == null || versionFrom.isAfter(previousVersion.getEffectiveFrom())) {
                    previousVersion = version;
                }
                continue;
            }

            if (versionFrom.isAfter(effectiveFrom)) {
                if (nextEffectiveFrom == null || versionFrom.isBefore(nextEffectiveFrom)) {
                    nextEffectiveFrom = versionFrom;
                }
            }
        }

        return new VersionNeighbors(previousVersion, nextEffectiveFrom);
    }

    private record VersionNeighbors(ContractVersion previousVersion, LocalDate nextEffectiveFrom) {
    }

    /** Ghép prefix revision vào note (giữ nguyên note cũ nếu có). */
    private String buildRevisionNote(String note, String prefix) {
        if (note == null || note.isBlank()) {
            return prefix;
        }
        return prefix + " | " + note;
    }

    /** Append thêm note (bỏ qua nếu extraNote rỗng). */
    private String appendNote(String currentNote, String extraNote) {
        if (extraNote == null || extraNote.isBlank()) {
            return currentNote;
        }
        if (currentNote == null || currentNote.isBlank()) {
            return extraNote;
        }
        return currentNote + " | " + extraNote;
    }

    /**
     * Khi update contract legacy: nếu thay đổi điều khoản tài chính thì tạo version mới từ hôm nay (hoặc startDate),
     * cap effectiveTo để tránh trùng version kế tiếp.
     */
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

        // Update flow legacy: tạo version mới "từ hôm nay" (hoặc từ startDate nếu startDate ở tương lai),
        // và cap effectiveTo để không chồng lấn với version kế tiếp.
        LocalDate effectiveFrom = LocalDate.now();
        if (contract.getStartDate() != null && contract.getStartDate().isAfter(effectiveFrom)) {
            effectiveFrom = contract.getStartDate();
        }
        if (request.getEndDate() != null && effectiveFrom.isAfter(request.getEndDate())) {
            throw new AppException(ErrorCode.CONTRACT_EFFECTIVE_DATE_INVALID);
        }

        VersionNeighbors neighbors = resolveVersionNeighbors(contract.getId(), effectiveFrom);

        if (neighbors.previousVersion() != null
                && neighbors.previousVersion().getEffectiveFrom() != null
                && effectiveFrom.isAfter(neighbors.previousVersion().getEffectiveFrom())) {
            LocalDate previousEffectiveTo = effectiveFrom.minusDays(1);
            if (neighbors.previousVersion().getEffectiveTo() == null
                    || neighbors.previousVersion().getEffectiveTo().isAfter(previousEffectiveTo)) {
                neighbors.previousVersion().setEffectiveTo(previousEffectiveTo);
                contractVersionRepository.save(neighbors.previousVersion());
            }
        }

        LocalDate effectiveTo = request.getEndDate();
        if (neighbors.nextEffectiveFrom() != null) {
            LocalDate capTo = neighbors.nextEffectiveFrom().minusDays(1);
            if (effectiveTo == null || effectiveTo.isAfter(capTo)) {
                effectiveTo = capTo;
            }
        }
        if (effectiveTo != null && effectiveTo.isBefore(effectiveFrom)) {
            throw new AppException(ErrorCode.CONTRACT_EFFECTIVE_DATE_INVALID);
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
                .effectiveFrom(effectiveFrom)
                .effectiveTo(effectiveTo)
                .note("Auto-generated version from contract update flow")
                .createdBy(SecurityUtils.getCurrentUser())
                .build();
        contractVersionRepository.save(nextVersion);
        observabilityMetricsService.incrementContractVersionChanged(contract, "update");
    }

    /** Kiểm tra các field giá/cọc/kỳ thanh toán/start/end có thay đổi so với contract hiện tại không. */
    private boolean hasFinancialTermsChanged(Contract contract, ContractRequest request) {
        return !Objects.equals(contract.getDeposit(), request.getDeposit())
                || !Objects.equals(contract.getRentPrice(), request.getRentPrice())
                || !Objects.equals(contract.getPaymentCycleMonths(), request.getPaymentCycleMonths())
                || !Objects.equals(contract.getMonthlyPaymentDay(), request.getMonthlyPaymentDay())
                || !Objects.equals(contract.getStartDate(), request.getStartDate())
                || !Objects.equals(contract.getEndDate(), request.getEndDate());
    }

    /** Map số tháng chu kỳ thanh toán về enum BillingCycle. */
    private BillingCycle resolveBillingCycle(Integer paymentCycleMonths) {
        if (paymentCycleMonths == null || paymentCycleMonths <= 1) {
            return BillingCycle.MONTHLY;
        }
        return BillingCycle.MONTHLY;
    }

    /** Ghi lại transition status ở cấp ContractStatus (helper map sang lifecycle state). */
    private void recordStateTransition(
            Contract contract, ContractStatus fromStatus, ContractStatus toStatus, String reason) {
        recordLifecycleTransition(contract, mapLifecycleState(fromStatus), mapLifecycleState(toStatus), reason, null);
    }

    /** Lưu log chuyển trạng thái lifecycle, kèm metadata/audit. */
    private void recordLifecycleTransition(
            Contract contract,
            ContractLifecycleState fromState,
            ContractLifecycleState toState,
            String reason,
            String metadataJson) {
        User currentUser = SecurityUtils.getCurrentUser();
        ContractStateTransition transition = ContractStateTransition.builder()
                .organization(contract.getOrganization())
                .contract(contract)
                .fromState(fromState)
                .toState(toState)
                .reason(reason)
                .metadataJson(buildAuditMetadataJson(reason, metadataJson, currentUser))
                .changedBy(currentUser)
                .changedAt(new Date())
                .build();
        contractStateTransitionRepository.save(transition);
    }

    /** Map ContractStatus sang ContractLifecycleState phục vụ thống nhất log/state machine. */
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

    /**
     * Đồng bộ trạng thái phòng (AVAILABLE/OCCUPIED) dựa trên hợp đồng active hiệu lực tại thời điểm hiện tại.
     */
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

    /** Convert java.util.Date về LocalDate theo system timezone. */
    private LocalDate toLocalDate(Date date) {
        return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
    }

    /**
     * Resolve tenant khi tạo hợp đồng:
     * - Nếu có tenantId: load + validate quyền.
     * - Nếu truyền payload tenant: validate email duy nhất, password bắt buộc, tạo user + tenant mới.
     */
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

    /**
     * Resolve tenant khi update contract: ưu tiên tenantId mới; nếu không, update thông tin tenant hiện tại từ payload.
     */
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

    /**
     * Đồng bộ danh sách utility gắn với phòng dựa trên payload contract (create/update).
     * - Thêm mới/ cập nhật quantity/usage/start-end.
     * - Xóa những utility không còn trong payload.
     */
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

    /** Load/validate hoặc tạo mới utility gắn với boarding house theo yêu cầu contract. */
    private Utility resolveUtility(BoardingHouse boardingHouse, ContractUtilityRequest utilityRequest) {
        if (utilityRequest.getUtilityId() != null) {
            Utility utility = utilityRepository
                    .findById(utilityRequest.getUtilityId())
                    .orElseThrow(() -> new AppException(ErrorCode.UTILITY_NOT_FOUND));
            if (utility.getIsActive() != null && !utility.getIsActive()) {
                throw new AppException(ErrorCode.UTILITY_INACTIVE);
            }
            if (!utilityAppliesToBoardingHouse(utility, boardingHouse)) {
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
                .owner(managedBoardingHouse.getOwner())
                .boardingHouses(Set.of(managedBoardingHouse))
                .build();
        return utilityRepository.save(utility);
    }

    /** Utility chỉ hợp lệ nếu thuộc owner hoặc thuộc danh sách boarding house cụ thể. */
    private boolean utilityAppliesToBoardingHouse(Utility utility, BoardingHouse boardingHouse) {
        if (utility.getBoardingHouses() == null || utility.getBoardingHouses().isEmpty()) {
            return utility.getOwner() != null
                    && boardingHouse != null
                    && boardingHouse.getOwner() != null
                    && utility.getOwner()
                    .getId()
                    .equals(boardingHouse.getOwner().getId());
        }

        return utility.getBoardingHouses().stream()
                .anyMatch(house -> house.getId().equals(boardingHouse.getId()));
    }

    /** Nếu quantity null thì mặc định 1. */
    private Integer resolveQuantity(ContractUtilityRequest utilityRequest) {
        Integer quantity = utilityRequest.getQuantity();
        return quantity == null || quantity < 1 ? 1 : quantity;
    }

    /** Kiểm tra quyền trên contract thông qua quyền phòng. */
    private void validateContractAccess(Contract contract) {
        validateRoomAccess(contract.getRoom());
    }

    /** Chặn các thao tác lifecycle không hợp lệ theo trạng thái hiện tại. */
    private void ensureLifecycleActionAllowed(Contract contract, String action) {
        ContractStatus status = contract.getStatus();

        switch (action) {
            case "finalize-settlement" -> {
                if (status == ContractStatus.CANCELLED || status == ContractStatus.PENDING) {
                    throw new AppException(ErrorCode.CONTRACT_LIFECYCLE_OPERATION_NOT_ALLOWED);
                }
            }
            case "terminate", "transfer-room" -> {
                if (status == ContractStatus.CANCELLED || status == ContractStatus.EXPIRED) {
                    throw new AppException(ErrorCode.CONTRACT_LIFECYCLE_OPERATION_NOT_ALLOWED);
                }
            }
            default -> {
                if (status == ContractStatus.CANCELLED) {
                    throw new AppException(ErrorCode.CONTRACT_LIFECYCLE_OPERATION_NOT_ALLOWED);
                }
            }
        }
    }

    /** Lấy state lifecycle mới nhất từ transition log; fallback status hiện tại. */
    private ContractLifecycleState resolveLatestLifecycleState(Contract contract) {
        return contractStateTransitionRepository.findByContractIdOrderByChangedAtDesc(contract.getId()).stream()
                .findFirst()
                .map(ContractStateTransition::getToState)
                .orElse(mapLifecycleState(contract.getStatus()));
    }

    /** Thực thi action detail với idempotency guard (Idempotency-Key từ request). */
    private ContractDetailResponse executeIdempotentDetailOperation(
            Contract contract, ContractOperationType operationType, Supplier<ContractDetailResponse> action) {
        IdempotentOperationGuard guard = beginIdempotentOperation(contract, operationType);
        if (guard.replayExistingResult()) {
            // Nếu request đã COMPLETED trước đó với cùng Idempotency-Key, trả lại trạng thái hiện tại của contract.
            Contract refreshedContract =
                    contractRepository.findById(contract.getId()).orElse(contract);
            return toDetailResponse(refreshedContract);
        }

        try {
            ContractDetailResponse response = action.get();
            completeOperationLog(guard.operationLog(), null);
            return response;
        } catch (RuntimeException ex) {
            throw ex;
        }
    }

    /** Idempotent cho luồng transfer-room, lưu/đọc resultJson nếu đã chạy trước đó. */
    private ContractRoomTransferResponse executeIdempotentTransferOperation(
            Contract contract, Supplier<ContractRoomTransferResponse> action) {
        IdempotentOperationGuard guard = beginIdempotentOperation(contract, ContractOperationType.TRANSFER_ROOM);
        if (guard.replayExistingResult()) {
            String resultJson =
                    guard.operationLog() == null ? null : guard.operationLog().getResultJson();
            if (resultJson != null && !resultJson.isBlank()) {
                // Transfer-room cần trả lại payload (targetContractId, transferredDepositAmount...), nên lưu
                // resultJson.
                return gson.fromJson(resultJson, ContractRoomTransferResponse.class);
            }
            throw new AppException(ErrorCode.CONTRACT_LIFECYCLE_OPERATION_NOT_ALLOWED);
        }

        try {
            ContractRoomTransferResponse response = action.get();
            completeOperationLog(guard.operationLog(), gson.toJson(response));
            return response;
        } catch (RuntimeException ex) {
            throw ex;
        }
    }

    /** Tạo/đọc operation log theo Idempotency-Key để phòng duplicate. */
    private IdempotentOperationGuard beginIdempotentOperation(Contract contract, ContractOperationType operationType) {
        String idempotencyKey = RequestAuditUtils.getCurrentIdempotencyKey();
        if (idempotencyKey == null) {
            return IdempotentOperationGuard.noop();
        }

        // Idempotency dựa trên (contractId, operationType, idempotencyKey). Nếu đã tồn tại log COMPLETED thì replay.
        ContractOperationLog existingOperationLog = findOperationLog(contract.getId(), operationType, idempotencyKey);
        if (existingOperationLog != null) {
            return buildGuardFromExistingLog(existingOperationLog);
        }

        ContractOperationLog operationLog = ContractOperationLog.builder()
                .organization(contract.getOrganization())
                .contract(contract)
                .operationType(operationType)
                .idempotencyKey(idempotencyKey)
                .status(ContractOperationStatus.PROCESSING)
                .requestId(RequestAuditUtils.getCurrentRequestId())
                .actor(SecurityUtils.getCurrentUser())
                .metadataJson(buildOperationLogMetadataJson(
                        operationType, ContractOperationStatus.PROCESSING, SecurityUtils.getCurrentUser()))
                .build();
        try {
            return new IdempotentOperationGuard(contractOperationLogRepository.saveAndFlush(operationLog), false);
        } catch (DataIntegrityViolationException ex) {
            // Có thể bị race-condition (2 request cùng lúc tạo log). Lúc này query lại và build guard từ record đã
            // persist.
            ContractOperationLog persistedOperationLog =
                    findOperationLog(contract.getId(), operationType, idempotencyKey);
            if (persistedOperationLog != null) {
                return buildGuardFromExistingLog(persistedOperationLog);
            }
            throw ex;
        }
    }

    /** Nếu log đã COMPLETED thì replay, nếu đang PROCESSING thì chặn thao tác trùng. */
    private IdempotentOperationGuard buildGuardFromExistingLog(ContractOperationLog operationLog) {
        if (operationLog.getStatus() == ContractOperationStatus.COMPLETED) {
            return new IdempotentOperationGuard(operationLog, true);
        }
        throw new AppException(ErrorCode.CONTRACT_OPERATION_ALREADY_PROCESSING);
    }

    /** Tìm operation log theo (contractId, type, idempotencyKey). */
    private ContractOperationLog findOperationLog(
            Integer contractId, ContractOperationType operationType, String idempotencyKey) {
        return contractOperationLogRepository
                .findByContractIdAndOperationTypeAndIdempotencyKey(contractId, operationType, idempotencyKey)
                .orElse(null);
    }

    /** Đánh dấu operation log COMPLETED, lưu actor/result/metadata. */
    private void completeOperationLog(ContractOperationLog operationLog, String resultJson) {
        if (operationLog == null) {
            return;
        }

        User currentUser = SecurityUtils.getCurrentUser();
        operationLog.setStatus(ContractOperationStatus.COMPLETED);
        operationLog.setCompletedAt(new Date());
        operationLog.setActor(currentUser);
        operationLog.setRequestId(RequestAuditUtils.getCurrentRequestId());
        operationLog.setResultJson(resultJson);
        operationLog.setMetadataJson(buildOperationLogMetadataJson(
                operationLog.getOperationType(), ContractOperationStatus.COMPLETED, currentUser));
        contractOperationLogRepository.save(operationLog);
    }

    /** Helper to json hoặc null nếu metadata rỗng. */
    private String buildMetadataJson(Map<String, Object> metadata) {
        if (metadata == null || metadata.isEmpty()) {
            return null;
        }
        return gson.toJson(metadata);
    }

    /** Chuẩn hóa metadata audit (reason, requestId, actor, details...). */
    private String buildAuditMetadataJson(String reason, String metadataJson, User currentUser) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("reasonCode", reason);
        metadata.put("requestId", RequestAuditUtils.getCurrentRequestId());
        metadata.put("actorId", currentUser == null ? null : currentUser.getId());
        metadata.put("actorName", currentUser == null ? null : currentUser.getFullName());

        if (metadataJson != null && !metadataJson.isBlank()) {
            try {
                metadata.put("details", gson.fromJson(metadataJson, Object.class));
            } catch (Exception ex) {
                metadata.put("detailsRaw", metadataJson);
            }
        }

        return buildMetadataJson(metadata);
    }

    private Map<String, Object> buildRenewalMetadata(
            LocalDate effectiveFrom,
            LocalDate newEndDate,
            BigDecimal nextRentPrice,
            BigDecimal nextDepositAmount,
            Integer nextPaymentCycleMonths,
            Integer nextMonthlyPaymentDay,
            boolean autoGenerated) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("effectiveFrom", effectiveFrom == null ? null : effectiveFrom.toString());
        metadata.put("newEndDate", newEndDate == null ? null : newEndDate.toString());
        metadata.put("rentPrice", nextRentPrice);
        metadata.put("depositAmount", nextDepositAmount);
        metadata.put("paymentCycleMonths", nextPaymentCycleMonths);
        metadata.put("monthlyPaymentDay", nextMonthlyPaymentDay);
        metadata.put("autoGenerated", autoGenerated);
        return metadata;
    }

    private String buildOperationLogMetadataJson(
            ContractOperationType operationType, ContractOperationStatus status, User currentUser) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("operationType", operationType.name());
        metadata.put("status", status.name());
        metadata.put("requestId", RequestAuditUtils.getCurrentRequestId());
        metadata.put("actorId", currentUser == null ? null : currentUser.getId());
        metadata.put("actorName", currentUser == null ? null : currentUser.getFullName());
        return buildMetadataJson(metadata);
    }

    private record IdempotentOperationGuard(ContractOperationLog operationLog, boolean replayExistingResult) {
        private static IdempotentOperationGuard noop() {
            return new IdempotentOperationGuard(null, false);
        }
    }

    /**
     * Tenant lifecycle notification: chỉ gửi cho tenant liên quan hợp đồng.
     * Dùng cho các sự kiện quan trọng (tạo/renew/terminate/transfer...) để tenant nắm thông tin kịp thời.
     * Không gửi nếu tenant/user thiếu thông tin id hợp lệ.
     */
    private void notifyTenantLifecycleEvent(
            Contract contract, String title, String message, String type, Map<String, Object> data) {
        if (contract.getTenant() == null
                || contract.getTenant().getUser() == null
                || contract.getTenant().getUser().getId() == null) {
            return;
        }

        try {
            notificationService.sendToUser(contract.getTenant().getUser().getId(), title, message, type, data);
        } catch (Exception ex) {
            log.warn("Failed to send lifecycle notification for contract {}: {}", contract.getId(), ex.getMessage());
        }
    }

    /**
     * Owner lifecycle notification: chỉ gửi cho owner.
     * Lý do: owner có thể quản lý nhiều hợp đồng/tenant; không gom chung với luồng tenant để tránh spam nhầm.
     * Bỏ qua khi actor hiện tại chính là owner (không tự gửi cho mình) hoặc thiếu thông tin owner.
     */
    private void notifyOwnerLifecycleEvent(
            Contract contract, String title, String message, String type, Map<String, Object> data) {
        if (contract == null || contract.getRoom() == null || contract.getRoom().getBoardingHouse() == null) {
            return;
        }

        User actor = SecurityUtils.getCurrentUser();
        if (actor == null || !SecurityUtils.isAdmin()) {
            return;
        }

        User owner = contract.getRoom().getBoardingHouse().getOwner();
        if (owner == null || owner.getId() == null) {
            return;
        }
        if (actor.getId() != null && owner.getId().equals(actor.getId())) {
            return;
        }

        try {
            notificationService.sendToUser(owner.getId(), title, message, type, data);
        } catch (Exception ex) {
            log.warn(
                    "Failed to send owner lifecycle notification for contract {}: {}",
                    contract.getId(),
                    ex.getMessage());
        }
    }

    /**
     * Đảm bảo current user có quyền thao tác tenant (admin hoặc owner của tenant).
     * Ném AppException ACCESS_DENIED/UNAUTHENTICATED nếu không hợp lệ.
     */
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
        List<ContractStateTransition> stateTransitions =
                contractStateTransitionRepository.findByContractIdOrderByChangedAtDesc(contract.getId());
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
                .autoRenew(Boolean.TRUE.equals(contract.getAutoRenew()))
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
                .depositTransactions(DepositLedgerHelper.toSummaryResponses(depositTransactions))
                .depositSummary(DepositLedgerHelper.summarize(depositTransactions))
                .settlementPreview(toSettlementPreview(bills, depositTransactions))
                .latestLifecycleState(
                        stateTransitions.isEmpty()
                                ? mapLifecycleState(contract.getStatus())
                                : stateTransitions.get(0).getToState())
                .stateTransitions(stateTransitions.stream()
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
                .metadataJson(transition.getMetadataJson())
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
        Integer utilityId = billingRule.getUtility() == null
                ? null
                : billingRule.getUtility().getId();
        Integer quantity = billingRule.getContract() != null
                && billingRule.getContract().getRoom() != null
                && billingRule.getContract().getRoom().getRoomUtilities() != null
                ? billingRule.getContract().getRoom().getRoomUtilities().stream()
                .filter(roomUtility -> roomUtility.getUtility() != null)
                .filter(roomUtility ->
                        Objects.equals(roomUtility.getUtility().getId(), utilityId))
                .map(roomUtility -> {
                    Integer configuredQuantity = roomUtility.getQuantity();
                    return configuredQuantity == null || configuredQuantity < 1 ? 1 : configuredQuantity;
                })
                .findFirst()
                .orElse(1)
                : 1;
        return ContractBillingRuleSummaryResponse.builder()
                .id(billingRule.getId())
                .utilityId(utilityId)
                .utilityName(
                        billingRule.getUtility() == null
                                ? null
                                : billingRule.getUtility().getName())
                .quantity(quantity)
                .cycle(billingRule.getCycle())
                .unitPrice(billingRule.getUnitPrice())
                .calculationType(billingRule.getCalculationType())
                .effectiveFrom(billingRule.getEffectiveFrom())
                .effectiveTo(billingRule.getEffectiveTo())
                .active(billingRule.getIsActive())
                .note(billingRule.getNote())
                .build();
    }

    private ContractSettlementPreviewResponse toSettlementPreview(
            List<carevn.luv2code.ez_tro.entity.Bill> bills, List<DepositTransaction> transactions) {
        BigDecimal paidBillsTotal = BigDecimal.ZERO;
        BigDecimal unpaidBillsTotal = BigDecimal.ZERO;
        int openBillCount = 0;

        // Tính theo outstanding thực tế để phản ánh đúng partial/overpaid.
        for (carevn.luv2code.ez_tro.entity.Bill bill : bills) {
            if (bill.getStatus() == BillStatus.CANCELLED) {
                continue;
            }
            BigDecimal invoiceTotal = bill.getAmount() == null ? BigDecimal.ZERO : bill.getAmount();
            BigDecimal outstanding =
                    nullToZero(invoiceBalanceCalculator.calculate(bill).getOutstandingAmount());
            BigDecimal paidPart = invoiceTotal.subtract(outstanding).max(BigDecimal.ZERO);

            paidBillsTotal = paidBillsTotal.add(paidPart);
            unpaidBillsTotal = unpaidBillsTotal.add(outstanding);
            if (outstanding.signum() > 0) {
                openBillCount++;
            }
        }

        BigDecimal depositBalance = DepositLedgerHelper.summarize(transactions).getCurrentBalance();
        // Refund/AdditionalCharge là 2 vế max(0) để tránh số âm.
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

    private BigDecimal nullToZero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
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
