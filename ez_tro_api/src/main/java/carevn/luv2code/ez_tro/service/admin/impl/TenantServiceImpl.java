package carevn.luv2code.ez_tro.service.admin.impl;

import java.util.Comparator;
import java.util.Date;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.TenantMapper;
import carevn.luv2code.ez_tro.repository.TenantRepository;
import carevn.luv2code.ez_tro.repository.UserRepository;
import carevn.luv2code.ez_tro.service.admin.TenantService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TenantServiceImpl implements TenantService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final TenantMapper tenantMapper;

    @Override
    public TenantResponse create(TenantRequest request) {
        User user = userRepository
                .findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Tenant tenant = tenantMapper.toEntity(request);
        tenant.setUser(user);

        tenant = tenantRepository.save(tenant);
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
    public List<TenantResponse> getAll() {
        return tenantRepository.findAll().stream().map(tenantMapper::toResponse).toList();
    }

    @Override
    public Page<TenantResponse> getAllTenantsPaged(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        return tenantRepository.findAll(pageRequest).map(tenantMapper::toResponse);
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
