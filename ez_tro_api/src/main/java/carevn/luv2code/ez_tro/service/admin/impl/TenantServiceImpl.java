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

import carevn.luv2code.ez_tro.dto.requests.TenantRequest;
import carevn.luv2code.ez_tro.dto.response.CurrentRentalInfoResponse;
import carevn.luv2code.ez_tro.dto.response.TenantDetailResponse;
import carevn.luv2code.ez_tro.dto.response.TenantResponse;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.Tenant;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.ContractStatus;
import carevn.luv2code.ez_tro.enums.Gender;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.TenantMapper;
import carevn.luv2code.ez_tro.repository.TenantRepository;
import carevn.luv2code.ez_tro.repository.UserRepository;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.TenantService;
import carevn.luv2code.ez_tro.specification.TenantSpecs;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TenantServiceImpl implements TenantService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final TenantMapper tenantMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public TenantResponse create(TenantRequest request) {
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
                .enabled(true)
                .accountNonExpired(true)
                .credentialsNonExpired(true)
                .accountNonLocked(true)
                .build();

        userRepository.save(user);

        tenant.setUser(user);

        tenant = tenantRepository.save(tenant);

        // Handle email noti when create tenant if needed
        // .....

        return tenantMapper.toResponse(tenant);
    }

    @Override
    public TenantResponse update(Integer id, TenantRequest request) {
        Tenant tenant = tenantRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_FOUND));

        tenant.setIdentityNumber(request.getIdentityNumber());
        tenant.setDateOfBirth(request.getDateOfBirth());
        tenant.setGender(request.getGender());
        tenant.setOccupation(request.getOccupation());
        tenant.setNote(request.getNote());

        tenant = tenantRepository.save(tenant);
        return tenantMapper.toResponse(tenant);
    }

    @Override
    public void delete(Integer id) {
        Tenant tenant = tenantRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_FOUND));
        tenantRepository.delete(tenant);
    }

    @Override
    public TenantResponse getById(Integer id) {
        Tenant tenant = tenantRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_FOUND));
        return tenantMapper.toResponse(tenant);
    }

    @Override
    @Transactional(readOnly = true)
    public TenantDetailResponse getTenantDetail(Integer id) {
        Tenant tenant = getTenantWithDetails(id);
        TenantDetailResponse response = tenantMapper.toDetailResponse(tenant);
        setContractStatus(response, tenant.getContracts());
        return response;
    }

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
                .filter(c -> isCurrentContract(c, new Date()))
                .max(Comparator.comparing(Contract::getStartDate))
                .orElse(null);

        if (currentContract == null) {
            return CurrentRentalInfoResponse.builder()
                    .contractStatus("Không có hợp đồng hiện tại")
                    .isLiving(false)
                    .build();
        }

        // Build response with exact mappings
        return CurrentRentalInfoResponse.builder()
                .contractCode(currentContract.getContractCode())
                .contractStatus("Đang Hiệu Lực") // Hardcoded based on active status
                .startDate(currentContract.getStartDate())
                .endDate(currentContract.getEndDate())
                .rentPrice(currentContract.getRentPrice())
                .deposit(currentContract.getDeposit())
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

    @Override
    public Page<TenantResponse> getAllTenantsPaged(Pageable pageable) {
        SecurityUtils.SpecificationSafeUser safe = SecurityUtils.safeUser();

        Specification<Tenant> spec = Specification.where(null);

        if (!safe.isAdmin()) {
            spec = spec.and(TenantSpecs.ownedByOwner(safe.get()));
        }

        return tenantRepository.findAll(spec, pageable).map(tenantMapper::toResponse);
    }

    @Override
    public List<TenantResponse> getAll() {
        return getAllTenantsPaged(Pageable.unpaged()).getContent();
    }

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

        Date today = new Date();
        boolean isCurrent = newestContract.getStartDate().before(today)
                && (newestContract.getEndDate() == null
                        || newestContract.getEndDate().after(today));

        if (newestContract.getStatus() == ContractStatus.ACTIVE && isCurrent) {
            response.setContractStatus("Đang thuê");
            response.setIsLiving(true);
        } else {
            response.setContractStatus("Đã kết thúc");
            response.setIsLiving(false);
        }
    }

    // Helper: Check if contract is current
    private boolean isCurrentContract(Contract contract, Date today) {
        return contract.getStartDate().before(today)
                && (contract.getEndDate() == null || contract.getEndDate().after(today));
    }
}
