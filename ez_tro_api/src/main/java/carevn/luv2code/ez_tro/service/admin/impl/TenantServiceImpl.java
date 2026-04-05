package carevn.luv2code.ez_tro.service.admin.impl;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.Date;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.requests.TenantCreateRequest;
import carevn.luv2code.ez_tro.dto.requests.TenantUpdateRequest;
import carevn.luv2code.ez_tro.dto.response.ContractSnapshotResponse;
import carevn.luv2code.ez_tro.dto.response.CurrentRentalInfoResponse;
import carevn.luv2code.ez_tro.dto.response.TenantDetailResponse;
import carevn.luv2code.ez_tro.dto.response.TenantResponse;
import carevn.luv2code.ez_tro.entity.BoardingHouse;
import carevn.luv2code.ez_tro.entity.Building;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.Tenant;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.ContractStatus;
import carevn.luv2code.ez_tro.enums.Gender;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.TenantMapper;
import carevn.luv2code.ez_tro.repository.BoardingHouseRepository;
import carevn.luv2code.ez_tro.repository.BuildingRepository;
import carevn.luv2code.ez_tro.repository.RoleRepository;
import carevn.luv2code.ez_tro.repository.TenantRepository;
import carevn.luv2code.ez_tro.repository.UserRepository;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.ContractSnapshotService;
import carevn.luv2code.ez_tro.service.admin.NotificationService;
import carevn.luv2code.ez_tro.service.admin.TenantService;
import carevn.luv2code.ez_tro.specification.TenantSpecs;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service xử lý nghiệp vụ người thuê (Tenant) phía admin/owner.
 *
 * <p>Trách nhiệm chính:
 * <ul>
 *   <li>Tạo tenant kèm tài khoản {@link User} (role USER) và gắn owner hiện tại.</li>
 *   <li>Cập nhật/xóa tenant.</li>
 *   <li>Lấy detail tenant và thông tin thuê hiện tại (dựa trên contract ACTIVE + effective date).</li>
 *   <li>Filter/phân trang theo quyền (admin/owner).</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TenantServiceImpl implements TenantService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final TenantMapper tenantMapper;
    private final PasswordEncoder passwordEncoder;
    private final ResourceLimitServiceImpl resourceLimitService;
    private final BoardingHouseRepository boardingHouseRepository;
    private final BuildingRepository buildingRepository;
    private final RoleRepository roleRepository;
    private final ContractSnapshotService contractSnapshotService;
    private final NotificationService notificationService;

    /**
     * Tạo mới tenant và user account tương ứng.
     *
     * @param request payload tạo tenant
     * @return tenant DTO sau khi tạo
     */
    @Override
    public TenantResponse create(TenantCreateRequest request) {
        Integer ownerId = SecurityUtils.getCurrentUserId();

        // Validate quota tenant
        resourceLimitService.validateCanCreateTenant(ownerId);
        validateCreateContext(request.getBoardingHouseId(), request.getBuildingId());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        Tenant tenant = tenantMapper.toEntity(request);

        User user = User.builder()
                .email(request.getEmail())
                .userName(request.getEmail())
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .originalPassword(request.getPassword())
                .address(request.getPermanentAddress())
                .enabled(true)
                .accountNonExpired(true)
                .credentialsNonExpired(true)
                .accountNonLocked(true)
                .roles(java.util.Set.of(roleRepository
                        .findByName("USER")
                        .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND))))
                .build();

        userRepository.save(user);

        tenant.setUser(user);
        tenant.setOwner(SecurityUtils.getCurrentUser());

        tenant = tenantRepository.save(tenant);

        try {
            notificationService.sendToUser(
                    ownerId,
                    "Tạo khách thuê thành công",
                    "Bạn đã tạo khách thuê " + request.getFullName() + " (" + request.getEmail() + ") thành công.",
                    "OWNER_TENANT_CREATED",
                    java.util.Map.of(
                            "tenantId", tenant.getId(),
                            "tenantName", request.getFullName(),
                            "tenantEmail", request.getEmail(),
                            "dedupeKey", "owner-tenant-created-" + tenant.getId()));
        } catch (Exception ex) {
            log.warn(
                    "Failed to send owner tenant created notification for tenant {}: {}",
                    tenant.getId(),
                    ex.getMessage());
        }

        try {
            notificationService.sendToUser(
                    user.getId(),
                    "Tài khoản của bạn đã được tạo",
                    "Tài khoản EZ TRO đã được tạo thành công. Bạn có thể đăng nhập bằng email đã đăng ký.",
                    "TENANT_ACCOUNT_WELCOME",
                    java.util.Map.of("tenantId", tenant.getId(), "profileAction", "WELCOME"));
        } catch (Exception ex) {
            log.warn("Failed to send tenant welcome notification for tenant {}: {}", tenant.getId(), ex.getMessage());
        }

        return tenantMapper.toResponse(tenant);
    }

    /**
     * Cập nhật tenant theo id (bao gồm cập nhật thông tin user nếu có).
     *
     * @param id id tenant
     * @param request payload cập nhật
     * @return tenant DTO sau khi cập nhật
     */
    @Override
    public TenantResponse update(Integer id, TenantUpdateRequest request) {
        Tenant tenant = tenantRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_FOUND));

        User user = tenant.getUser();
        if (user != null) {
            boolean emailChanged = !user.getEmail().equalsIgnoreCase(request.getEmail());
            if (emailChanged && userRepository.existsByEmail(request.getEmail())) {
                throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
            }

            user.setFullName(request.getFullName());
            user.setPhoneNumber(request.getPhoneNumber());
            user.setEmail(request.getEmail());
            user.setUserName(request.getEmail());
            user.setAddress(request.getPermanentAddress());

            if (request.getPassword() != null && !request.getPassword().isBlank()) {
                user.setPassword(passwordEncoder.encode(request.getPassword()));
                user.setOriginalPassword(request.getPassword());
            }
            userRepository.save(user);
        }

        tenant.setIdentityNumber(request.getIdentityNumber());
        tenant.setIssueDate(request.getIssueDate());
        tenant.setIssuePlace(request.getIssuePlace());
        tenant.setDateOfBirth(request.getDateOfBirth());
        tenant.setGender(request.getGender());
        tenant.setOccupation(request.getOccupation());
        tenant.setPermanentAddress(request.getPermanentAddress());
        tenant.setEmergencyContact(request.getEmergencyContact());
        tenant.setEmergencyPhone(request.getEmergencyPhone());
        tenant.setNote(request.getNote());

        tenant = tenantRepository.save(tenant);
        return tenantMapper.toResponse(tenant);
    }

    /**
     * Xóa tenant theo id.
     *
     * @param id id tenant
     */
    @Override
    public void delete(Integer id) {
        Tenant tenant = tenantRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_FOUND));
        tenantRepository.delete(tenant);
    }

    /**
     * Lấy tenant theo id.
     *
     * @param id id tenant
     * @return tenant DTO
     */
    @Override
    public TenantResponse getById(Integer id) {
        Tenant tenant = tenantRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_FOUND));
        return tenantMapper.toResponse(tenant);
    }

    /**
     * Lấy detail tenant (kèm contracts) và gán trạng thái thuê hiện tại.
     *
     * @param id id tenant
     * @return tenant detail DTO
     */
    @Override
    @Transactional(readOnly = true)
    public TenantDetailResponse getTenantDetail(Integer id) {
        Tenant tenant = getTenantWithDetails(id);
        TenantDetailResponse response = tenantMapper.toDetailResponse(tenant);
        setContractStatus(response, tenant.getContracts());
        return response;
    }

    /**
     * Lấy thông tin thuê hiện tại của tenant (contract ACTIVE đang hiệu lực tại today).
     *
     * @param id id tenant
     * @return current rental info
     */
    @Override
    @Transactional(readOnly = true)
    public CurrentRentalInfoResponse getCurrentRentalInfo(Integer id) {
        Tenant tenant = getTenantWithDetails(id);

        List<Contract> contracts = tenant.getContracts();
        if (contracts == null || contracts.isEmpty()) {
            return CurrentRentalInfoResponse.builder()
                    .contractStatus("Chưa thuê")
                    .isLiving(false)
                    .build();
        }

        // Find the most recent active and current contract
        Contract currentContract = contracts.stream()
                .filter(c -> c.getStatus() == ContractStatus.ACTIVE)
                .filter(c -> isCurrentContract(c, LocalDate.now()))
                .max(Comparator.comparing(Contract::getStartDate))
                .orElse(null);

        if (currentContract == null) {
            return CurrentRentalInfoResponse.builder()
                    .contractStatus("Không có hợp đồng hiện tại")
                    .isLiving(false)
                    .build();
        }

        ContractSnapshotResponse snapshot =
                contractSnapshotService.getSnapshot(currentContract.getId(), LocalDate.now());

        // Build response with exact mappings
        return CurrentRentalInfoResponse.builder()
                .contractCode(currentContract.getContractCode())
                .contractStatus("Đang Hiệu Lực") // Hardcoded based on active status
                .startDate(currentContract.getStartDate())
                .endDate(currentContract.getEndDate())
                .rentPrice(
                        snapshot.getCurrentVersion() != null
                                ? snapshot.getCurrentVersion().getPrice()
                                : currentContract.getRentPrice())
                .deposit(
                        snapshot.getCurrentVersion() != null
                                ? snapshot.getCurrentVersion().getDepositAmount()
                                : currentContract.getDeposit())
                .moveInDate(currentContract.getStartDate()) // Assume same as startDate
                .isContractRepresentative(true) // Assume "Có" - adjust if field exists in Contract
                .roomName(currentContract.getRoom().getRoomNumber())
                .floorNumber(currentContract.getRoom().getFloorNumber())
                .area(currentContract.getRoom().getArea())
                .boardingHouseName(currentContract.getRoom().getBoardingHouse().getName())
                .boardingHouseAddress(
                        currentContract.getRoom().getBoardingHouse().getAddress())
                .build();
    }

    /**
     * Lấy danh sách tenant phân trang theo quyền hiện tại.
     *
     * @param pageable phân trang/sort
     * @return page tenant DTO
     */
    @Override
    public Page<TenantResponse> getAllTenantsPaged(Pageable pageable) {
        SecurityUtils.SpecificationSafeUser safe = SecurityUtils.safeUser();

        Specification<Tenant> spec = Specification.where(null);

        if (!safe.isAdmin()) {
            spec = spec.and(TenantSpecs.ownedByOwner(safe.get()));
        }

        return tenantRepository.findAll(spec, pageable).map(tenantMapper::toResponse);
    }

    /**
     * Lấy danh sách tenant (không phân trang) theo quyền hiện tại.
     *
     * @return danh sách tenant DTO
     */
    @Override
    public List<TenantResponse> getAll() {
        return getAllTenantsPaged(Pageable.unpaged()).getContent();
    }

    /**
     * Lọc tenant theo nhiều tiêu chí (search/date range/gender/occupation/active contract...) và phân trang.
     *
     * @param search từ khóa
     * @param startDate ngày bắt đầu (yyyy-MM-dd)
     * @param endDate ngày kết thúc (yyyy-MM-dd)
     * @param gender giới tính
     * @param occupation nghề nghiệp
     * @param hasActiveContract lọc tenant có hợp đồng active
     * @param page trang (0-based)
     * @param size kích thước trang
     * @return page tenant DTO
     */
    @Override
    @Transactional(readOnly = true)
    public Page<TenantResponse> filterTenants(
            String search,
            String startDate,
            String endDate,
            String gender,
            String occupation,
            Boolean hasActiveContract,
            int page,
            int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        SecurityUtils.SpecificationSafeUser safe = SecurityUtils.safeUser();
        Specification<Tenant> spec = Specification.where(null);

        if (!safe.isAdmin()) {
            spec = spec.and(TenantSpecs.ownedByOwner(safe.get()));
        }

        if (search != null && !search.trim().isEmpty()) {
            String lowerSearch = search.toLowerCase().trim();

            spec = spec.and((root, query, cb) -> {
                Join<Tenant, User> userJoin = root.join("user", JoinType.LEFT);
                Predicate namePred = cb.like(
                        cb.lower(cb.concat(
                                cb.coalesce(userJoin.get("firstName"), cb.literal("")),
                                cb.concat(cb.literal(" "), cb.coalesce(userJoin.get("lastName"), cb.literal(""))))),
                        "%" + lowerSearch + "%");
                Predicate emailPred = cb.like(cb.lower(userJoin.get("email")), "%" + lowerSearch + "%");
                Predicate phonePred = cb.like(cb.lower(userJoin.get("phoneNumber")), "%" + lowerSearch + "%");
                Predicate identityPred = cb.like(cb.lower(root.get("identityNumber")), "%" + lowerSearch + "%");
                Predicate occupationPred = cb.like(cb.lower(root.get("occupation")), "%" + lowerSearch + "%");

                return cb.or(namePred, emailPred, phonePred, identityPred, occupationPred);
            });
        }

        if (startDate != null && endDate != null && !startDate.isEmpty() && !endDate.isEmpty()) {
            try {
                LocalDate start = LocalDate.parse(startDate);
                LocalDate end = LocalDate.parse(endDate);
                spec = spec.and((root, query, cb) -> cb.between(root.get("dateOfBirth"), start, end));
            } catch (Exception e) {
                log.warn("Invalid date format in filter: {}", e.getMessage());
            }
        }

        if (gender != null && !gender.isEmpty() && !"ALL".equalsIgnoreCase(gender)) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("gender"), Gender.valueOf(gender)));
        }

        if (occupation != null && !occupation.isEmpty() && !"ALL".equalsIgnoreCase(occupation)) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("occupation"), occupation));
        }

        if (hasActiveContract != null) {
            spec = spec.and((root, query, cb) -> {
                Subquery<Contract> subquery = query.subquery(Contract.class);
                Root<Contract> contractRoot = subquery.from(Contract.class);
                subquery.select(contractRoot);
                Join<Contract, Tenant> tenantJoin = contractRoot.join("tenant", JoinType.INNER);
                Date today = new Date();
                Predicate statusPred = cb.equal(contractRoot.get("status"), ContractStatus.ACTIVE);
                Predicate startDatePred = cb.lessThanOrEqualTo(contractRoot.get("startDate"), today);
                Predicate endDatePred = cb.or(
                        cb.isNull(contractRoot.get("endDate")),
                        cb.greaterThanOrEqualTo(contractRoot.get("endDate"), today));
                subquery.where(cb.equal(tenantJoin.get("id"), root.get("id")), statusPred, startDatePred, endDatePred);
                if (hasActiveContract) {
                    return cb.exists(subquery);
                } else {
                    return cb.not(cb.exists(subquery));
                }
            });
        }

        Page<Tenant> pageResult = tenantRepository.findAll(spec, pageable);
        Page<TenantResponse> dtoPage = pageResult.map(tenantMapper::toResponse);
        return dtoPage;
    }

    private Tenant getTenantWithDetails(Integer id) {
        return tenantRepository.findByIdWithDetails(id).orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_FOUND));
    }

    private void validateCreateContext(Integer boardingHouseId, Integer buildingId) {
        BoardingHouse boardingHouse = boardingHouseRepository
                .findById(boardingHouseId)
                .orElseThrow(() -> new AppException(ErrorCode.BOARDING_HOUSE_NOT_FOUND));

        Building building = buildingRepository
                .findById(buildingId)
                .orElseThrow(() -> new AppException(ErrorCode.BUILDING_NOT_FOUND));

        User currentUser = SecurityUtils.getCurrentUser();
        boolean isAdmin = currentUser.getRoles().stream().anyMatch(role -> "ADMIN".equals(role.getName()));

        if (!isAdmin && !boardingHouse.getOwner().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        if (building.getBoardingHouse() == null
                || !building.getBoardingHouse().getId().equals(boardingHouseId)) {
            throw new AppException(ErrorCode.BUILDING_NOT_FOUND);
        }
    }

    private void setContractStatus(TenantDetailResponse response, List<Contract> contracts) {
        if (contracts == null || contracts.isEmpty()) {
            response.setContractStatus("Chưa thuê");
            response.setIsLiving(false);
            return;
        }

        Contract newestContract = contracts.stream()
                .max(Comparator.comparing(Contract::getStartDate))
                .orElse(null);

        if (newestContract == null) {
            response.setContractStatus("Chưa thuê");
            response.setIsLiving(false);
            return;
        }

        boolean isCurrent = newestContract.getStartDate().isBefore(LocalDate.now())
                && (newestContract.getEndDate() == null
                        || newestContract.getEndDate().isAfter(LocalDate.now()));

        if (newestContract.getStatus() == ContractStatus.ACTIVE && isCurrent) {
            response.setContractStatus("Đang thuê");
            response.setIsLiving(true);
        } else {
            response.setContractStatus("Đã kết thúc");
            response.setIsLiving(false);
        }
    }

    // Helper: Check if contract is current
    private boolean isCurrentContract(Contract contract, LocalDate today) {
        return contract.getStartDate().isBefore(today)
                && (contract.getEndDate() == null || contract.getEndDate().isAfter(today));
    }
}
