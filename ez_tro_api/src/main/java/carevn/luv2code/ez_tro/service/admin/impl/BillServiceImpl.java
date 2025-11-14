package carevn.luv2code.ez_tro.service.admin.impl;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.requests.BillRequest;
import carevn.luv2code.ez_tro.dto.response.BillResponse;
import carevn.luv2code.ez_tro.entity.*;
import carevn.luv2code.ez_tro.enums.BillStatus;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.BillMapper;
import carevn.luv2code.ez_tro.repository.BillRepository;
import carevn.luv2code.ez_tro.repository.ContractRepository;
import carevn.luv2code.ez_tro.repository.TenantRepository;
import carevn.luv2code.ez_tro.repository.UserRepository;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.BillService;
import carevn.luv2code.ez_tro.service.admin.NotificationService;
import carevn.luv2code.ez_tro.specification.BillSpecs;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BillServiceImpl implements BillService {

    private final BillRepository billRepository;
    private final ContractRepository contractRepository;
    private final TenantRepository tenantRepository;
    private final BillMapper billMapper;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    public BillResponse create(BillRequest request) {
        Contract contract = contractRepository
                .findById(request.getContractId())
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));

        Room room = contract.getRoom();
        Tenant tenant = contract.getTenant();

        BigDecimal rentPrice = contract.getRentPrice();
        BigDecimal serviceAmount = request.getServiceAmount() != null ? request.getServiceAmount() : BigDecimal.ZERO;
        BigDecimal totalAmount = rentPrice.add(serviceAmount);

        Bill bill = billMapper.toEntity(request);
        bill.setContract(contract);
        bill.setRoom(room);
        bill.setTenant(tenant);
        bill.setAmount(totalAmount);
        bill.setStatus(BillStatus.UNPAID);
        bill.setCreatedAt(new Date());

        if (bill.getBillCode() == null || bill.getBillCode().isBlank()) {
            String timestamp = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
            bill.setBillCode("BILL-" + timestamp);
        }

        billRepository.save(bill);

        notificationService.sendToUser(
                tenant.getUser().getId(),
                "Hóa đơn mới",
                "Phòng " + room.getRoomNumber() + " - " + totalAmount + "đ - Hạn: " + bill.getDueDate(),
                "BILL_CREATED",
                Map.of("billId", bill.getId(), "roomNumber", room.getRoomNumber()));

        return billMapper.toResponse(bill);
    }

    @Override
    public BillResponse update(Integer id, BillRequest request) {
        Bill bill = billRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));

        //        bill.setAmount(request.getAmount());
        //        bill.setPaid(request.getPaid());
        //        bill.setPaymentDate(request.getPaymentDate());

        billRepository.save(bill);
        return billMapper.toResponse(bill);
    }

    @Override
    public void delete(Integer id) {
        Bill bill = billRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));
        billRepository.delete(bill);
    }

    @Override
    public BillResponse getById(Integer id) {
        Bill bill = billRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));
        return billMapper.toResponse(bill);
    }

    @Override
    public List<BillResponse> getAll() {
        return billRepository.findAll().stream().map(billMapper::toResponse).toList();
    }

    //    @Override
    //    public List<BillResponse> getBillsByTenant(Integer tenantId) {
    //        return billRepository.findByTenantId(tenantId)
    //                .stream()
    //                .map(billMapper::toResponse)
    //                .toList();
    //    }

    @Override
    @Transactional(readOnly = true)
    public Page<BillResponse> filterBills(
            String search,
            String status,
            Boolean paid,
            Integer month,
            Integer year,
            Integer contractId,
            int page,
            int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        SecurityUtils.SpecificationSafeUser safe = SecurityUtils.safeUser();

        Specification<Bill> spec = Specification.where(null);
        if (!safe.isAdmin()) {
            spec = spec.and(BillSpecs.ownedByOwner(safe.get()));
        }

        // Tìm kiếm
        if (search != null && !search.trim().isEmpty()) {
            String pattern = "%" + search.toLowerCase().trim() + "%";
            spec = spec.and((root, query, cb) -> {
                query.distinct(true);
                Join<Bill, Tenant> tenantJoin = root.join("tenant", JoinType.LEFT);
                Join<Tenant, User> userJoin = tenantJoin.join("user", JoinType.LEFT);

                Predicate code = cb.like(cb.lower(root.get("billCode")), pattern);
                Predicate title = cb.like(cb.lower(root.get("billTitle")), pattern);
                Predicate name = cb.like(
                        cb.lower(cb.concat(
                                cb.coalesce(userJoin.get("firstName"), cb.literal("")),
                                cb.concat(cb.literal(" "), cb.coalesce(userJoin.get("lastName"), cb.literal(""))))),
                        pattern);
                Predicate room = cb.like(cb.lower(root.join("room").get("roomNumber")), pattern);

                return cb.or(code, title, name, room);
            });
        }

        // Lọc trạng thái
        if (status != null && !status.isEmpty() && !"ALL".equalsIgnoreCase(status)) {
            spec = spec.and(BillSpecs.hasStatus(BillStatus.valueOf(status)));
        }

        // Lọc đã thanh toán
        if (paid != null) {
            spec = spec.and(BillSpecs.hasPaid(paid));
        }

        // Lọc theo tháng/năm
        if (month != null || year != null) {
            spec = spec.and(BillSpecs.inMonthYear(month, year));
        }

        // Lọc theo hợp đồng
        if (contractId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("contract").get("id"), contractId));
        }

        return billRepository.findAll(spec, pageable).map(billMapper::toResponse);
    }
}
