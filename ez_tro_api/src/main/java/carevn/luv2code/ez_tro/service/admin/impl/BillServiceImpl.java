package carevn.luv2code.ez_tro.service.admin.impl;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.requests.BillRequest;
import carevn.luv2code.ez_tro.dto.requests.InvoiceFinalizeRequest;
import carevn.luv2code.ez_tro.dto.response.BillResponse;
import carevn.luv2code.ez_tro.entity.Bill;
import carevn.luv2code.ez_tro.entity.Tenant;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.BillStatus;
import carevn.luv2code.ez_tro.enums.InvoiceType;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.BillMapper;
import carevn.luv2code.ez_tro.repository.BillRepository;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.BillService;
import carevn.luv2code.ez_tro.service.admin.BillingOrchestratorService;
import carevn.luv2code.ez_tro.specification.BillSpecs;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

/**
 * Service xử lý nghiệp vụ Hóa đơn (Bill) phía admin/owner.
 *
 * <p>Trách nhiệm chính:
 * <ul>
 *   <li>Tạo hóa đơn cho hợp đồng theo kỳ (dựa trên snapshot hợp đồng tại dueDate).</li>
 *   <li>Tính toán tổng tiền từ tiền thuê + phí dịch vụ + phát sinh - giảm giá.</li>
 *   <li>Hỗ trợ truy vấn/lọc hóa đơn theo quyền (admin thấy tất cả, owner chỉ thấy của mình).</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class BillServiceImpl implements BillService {

    private final BillRepository billRepository;
    private final BillMapper billMapper;
    private final BillingOrchestratorService billingOrchestratorService;

    /**
     * Tạo hóa đơn mới cho hợp đồng theo orchestrator (preview → finalize).
     *
     * <p>Payload chỉ cần {@code contractId} và {@code dueDate} (cùng với các ghi chú/extra/discount),
     * sau đó billing orchestrator sẽ dùng snapshot để build invoice lines và tránh duplicate bằng generation key.
     *
     * @param request payload tạo bill
     * @return bill DTO sau khi tạo
     */
    @Override
    public BillResponse create(BillRequest request) {
        LocalDate dueDate = request.getDueDate();
        if (dueDate == null) {
            throw new AppException(ErrorCode.CONTRACT_MONTHLY_PAYMENT_DAY_INVALID);
        }

        YearMonth period = YearMonth.from(dueDate);
        LocalDate periodStart = period.atDay(1);
        LocalDate periodEnd = period.atEndOfMonth();

        InvoiceFinalizeRequest finalizeRequest = InvoiceFinalizeRequest.builder()
                .contractId(request.getContractId())
                .asOfDate(dueDate)
                .billingPeriodStart(periodStart)
                .billingPeriodEnd(periodEnd)
                .dueDate(dueDate)
                .invoiceType(InvoiceType.MANUAL)
                .extraAmount(request.getExtraAmount())
                .discountAmount(request.getDiscountAmount())
                .discountReason(request.getDiscountReason())
                .publicNote(request.getPublicNote())
                .internalNote(request.getInternalNote())
                .build();

        return billingOrchestratorService.finalizeInvoice(finalizeRequest);
    }

    /**
     * Cập nhật bill theo id.
     *
     * <p>Lưu ý: hiện tại method này đang là placeholder (chưa cập nhật các field business như amount/status...).
     *
     * @param id id bill
     * @param request payload cập nhật
     * @return bill DTO sau khi cập nhật
     */
    @Override
    public BillResponse update(Integer id, BillRequest request) {
        Bill bill = billRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));

        //        bill.setAmount(request.getAmount());
        //        bill.setPaid(request.getPaid());
        //        bill.setPaymentDate(request.getPaymentDate());

        billRepository.save(bill);
        return billMapper.toResponse(bill);
    }

    /**
     * Xóa bill theo id.
     *
     * @param id id bill
     */
    @Override
    public void delete(Integer id) {
        Bill bill = billRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));
        billRepository.delete(bill);
    }

    /**
     * Lấy bill theo id.
     *
     * @param id id bill
     * @return bill DTO
     */
    @Override
    public BillResponse getById(Integer id) {
        Bill bill = billRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));
        return billMapper.toResponse(bill);
    }

    /**
     * Lấy tất cả bill (không phân trang).
     *
     * @return danh sách bill DTO
     */
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

    //    Tích hợp tự động tính tiền điện nước
    //    @Transactional
    //    public BillResponse generateMonthlyBill(Integer contractId, Integer month, Integer year) {
    //        Contract contract = contractRepository.findById(contractId)
    //                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
    //
    //        Room room = contract.getRoom();
    //
    //        // Lấy tất cả chỉ số trong kỳ
    //        List<MeterReading> readings = meterReadingRepository
    //                .findByRoomIdAndPeriodMonthAndPeriodYear(room.getId(), month, year);
    //
    //        BigDecimal totalUtility = readings.stream()
    //                .map(MeterReading::getAmount)
    //                .filter(amount -> amount != null)
    //                .reduce(BigDecimal.ZERO, BigDecimal::add);
    //
    //        BigDecimal totalAmount = contract.getRentPrice().add(totalUtility);
    //
    //        Bill bill = Bill.builder()
    //                .contract(contract)
    //                .room(room)
    //                .tenant(contract.getTenant())
    //                .billTitle("Hóa đơn tháng " + month + "/" + year)
    //                .amount(totalAmount)
    //                .serviceAmount(totalUtility) // phần điện nước + dịch vụ khác
    //                .status(BillStatus.UNPAID)
    //                .dueDate(calculateDueDate(month, year)) // implement hàm này
    //                .build();
    //
    //        if (bill.getBillCode() == null || bill.getBillCode().isBlank()) {
    //            String timestamp = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
    //            bill.setBillCode("BILL-" + timestamp);
    //        }
    //
    //        billRepository.save(bill);
    //
    //        // Gửi thông báo...
    //        // notificationService...
    //
    //        return billMapper.toResponse(bill);
    //    }
}
