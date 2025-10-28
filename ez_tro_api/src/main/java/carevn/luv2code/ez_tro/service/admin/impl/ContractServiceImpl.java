package carevn.luv2code.ez_tro.service.admin.impl;

import static carevn.luv2code.ez_tro.constants.AppConstants.CODE_TIMESTAMP_FORMAT;
import static carevn.luv2code.ez_tro.constants.AppConstants.CONTRACT_CODE_PREFIX;

import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.requests.BillRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractRequest;
import carevn.luv2code.ez_tro.dto.response.BillResponse;
import carevn.luv2code.ez_tro.dto.response.ContractResponse;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.Room;
import carevn.luv2code.ez_tro.entity.Tenant;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.ContractStatus;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.BillMapper;
import carevn.luv2code.ez_tro.mapper.ContractMapper;
import carevn.luv2code.ez_tro.repository.BillRepository;
import carevn.luv2code.ez_tro.repository.ContractRepository;
import carevn.luv2code.ez_tro.repository.RoomRepository;
import carevn.luv2code.ez_tro.repository.TenantRepository;
import carevn.luv2code.ez_tro.service.admin.ContractService;
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
    private final BillRepository billRepository;
    private final ContractMapper contractMapper;
    private final BillMapper billMapper;

    @Override
    public ContractResponse create(ContractRequest request) {
        Room room = roomRepository
                .findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        Tenant tenant = tenantRepository
                .findById(request.getTenantId())
                .orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_FOUND));

        Contract contract = contractMapper.toEntity(request);
        contract.setRoom(room);
        contract.setTenant(tenant);
        contract.setStatus(ContractStatus.ACTIVE);

        if (contract.getContractCode() == null) {
            String timestamp = new SimpleDateFormat(CODE_TIMESTAMP_FORMAT).format(new Date());
            contract.setContractCode(CONTRACT_CODE_PREFIX + timestamp);
        }

        contractRepository.save(contract);
        return contractMapper.toResponse(contract);
    }

    @Override
    public ContractResponse update(Integer id, ContractRequest request) {
        Contract contract =
                contractRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));

        if (request.getRoomId() != null) {
            Room room = roomRepository
                    .findById(request.getRoomId())
                    .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
            contract.setRoom(room);
        }
        if (request.getTenantId() != null) {
            Tenant tenant = tenantRepository
                    .findById(request.getTenantId())
                    .orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_FOUND));
            contract.setTenant(tenant);
        }

        contract.setStartDate(request.getStartDate());
        contract.setEndDate(request.getEndDate());
        contract.setDeposit(request.getDeposit());
        contract.setRentPrice(request.getRentPrice());
        contract.setStatus(request.getStatus());
        contract.setNote(request.getNote());
        contract.setUpdatedAt(new Date());

        contractRepository.save(contract);
        return contractMapper.toResponse(contract);
    }

    @Override
    public void delete(Integer id) {
        Contract contract =
                contractRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        contractRepository.delete(contract);
    }

    @Override
    @Transactional(readOnly = true)
    public ContractResponse getById(Integer id) {
        Contract contract =
                contractRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        return contractMapper.toResponse(contract);
    }

    @Override
    public List<ContractResponse> getAllActiveContracts() {
        LocalDate today = LocalDate.now();
        return contractRepository.findAllActiveContracts(ContractStatus.ACTIVE, today).stream()
                .map(contractMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContractResponse> getAll() {
        return contractRepository.findAll().stream()
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
}
