package carevn.luv2code.ez_tro.service.admin.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
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
import carevn.luv2code.ez_tro.dto.requests.InvoiceFinalizeRequest;
import carevn.luv2code.ez_tro.dto.response.BillResponse;
import carevn.luv2code.ez_tro.entity.Bill;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.Payment;
import carevn.luv2code.ez_tro.entity.PaymentAllocation;
import carevn.luv2code.ez_tro.entity.Tenant;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.BillStatus;
import carevn.luv2code.ez_tro.enums.ContractStatus;
import carevn.luv2code.ez_tro.enums.InvoiceType;
import carevn.luv2code.ez_tro.enums.PaymentAllocationType;
import carevn.luv2code.ez_tro.enums.PaymentStatus;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.BillMapper;
import carevn.luv2code.ez_tro.repository.BillRepository;
import carevn.luv2code.ez_tro.repository.ContractRepository;
import carevn.luv2code.ez_tro.repository.PaymentAllocationRepository;
import carevn.luv2code.ez_tro.repository.PaymentRepository;
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
    private final ContractRepository contractRepository;
    private final PaymentAllocationRepository paymentAllocationRepository;
    private final PaymentRepository paymentRepository;

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

        Contract contract = contractRepository
                .findById(request.getContractId())
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));

        YearMonth period = YearMonth.from(dueDate);
        LocalDate periodStart = period.atDay(1);
        LocalDate periodEnd = period.atEndOfMonth();

        validateBillRequest(contract, dueDate, periodStart, periodEnd, request);

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

    private void validateBillRequest(
            Contract contract, LocalDate dueDate, LocalDate periodStart, LocalDate periodEnd, BillRequest request) {

        if (contract.getStatus() != ContractStatus.ACTIVE) {
            throw new AppException(ErrorCode.CONTRACT_NOT_ACTIVE);
        }

        if (dueDate.isBefore(periodStart)) {
            throw new AppException(ErrorCode.BILL_DUE_DATE_INVALID);
        }

        if (contract.getStartDate() != null && dueDate.isBefore(contract.getStartDate())) {
            throw new AppException(ErrorCode.BILL_DUE_DATE_INVALID);
        }

        if (contract.getEndDate() != null && dueDate.isAfter(contract.getEndDate())) {
            throw new AppException(ErrorCode.BILL_DUE_DATE_INVALID);
        }

        BigDecimal serviceAmount = request.getServiceAmount() == null ? BigDecimal.ZERO : request.getServiceAmount();
        if (serviceAmount.signum() < 0) {
            throw new AppException(ErrorCode.BILL_SERVICE_AMOUNT_INVALID);
        }
    }

    /**
     * Cập nhật bill theo id.
     *
     * <p>Lưu ý: chỉ cho phép cập nhật các trường an toàn (dueDate/note/title) để tránh sai lệch công nợ.
     *
     * @param id id bill
     * @param request payload cập nhật
     * @return bill DTO sau khi cập nhật
     */
    @Override
    public BillResponse update(Integer id, BillRequest request) {
        Bill bill = billRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));

        validateBillAccess(bill);
        validateUpdateRequest(bill, request);

        if (bill.getStatus() == BillStatus.PAID || bill.getStatus() == BillStatus.CANCELLED) {
            throw new AppException(ErrorCode.BILL_UPDATE_NOT_ALLOWED);
        }

        if (request.getBillTitle() != null && !request.getBillTitle().isBlank()) {
            bill.setBillTitle(request.getBillTitle().trim());
        }

        LocalDate dueDate = request.getDueDate();
        if (dueDate != null) {
            bill.setDueDate(dueDate);
            // Cập nhật lại trạng thái theo hạn mới để tránh giữ OVERDUE sai.
            refreshStatusAfterDueDateChange(bill);
        }

        String note = resolveNoteForUpdate(request);
        if (note != null) {
            bill.setNote(note);
        }

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
        validateBillAccess(bill);
        // Không cho xóa bill đã được thanh toán hoặc đã có phân bổ để tránh sai lệch đối soát.
        if (bill.getStatus() != BillStatus.UNPAID) {
            throw new AppException(ErrorCode.BILL_DELETE_NOT_ALLOWED);
        }
        BigDecimal allocated = paymentAllocationRepository.sumAllocatedByBillId(bill.getId());
        if (allocated != null && allocated.signum() != 0) {
            throw new AppException(ErrorCode.BILL_DELETE_NOT_ALLOWED);
        }
        billRepository.delete(bill);
    }

    /**
     * Hủy hóa đơn: reverse các allocation liên quan và chuyển trạng thái bill sang CANCELLED.
     *
     * <p>Lưu ý: hủy bill KHÔNG xóa dữ liệu để giữ lịch sử đối soát.</p>
     *
     * @param id id bill
     * @return bill DTO sau khi hủy
     */
    @Transactional
    public BillResponse cancel(Integer id) {
        Bill bill = billRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));
        validateBillAccess(bill);

        // Nếu bill đã hủy thì trả lại luôn để tránh tạo reverse lặp.
        if (bill.getStatus() == BillStatus.CANCELLED) {
            return billMapper.toResponse(bill);
        }

        // Không cho hủy bill đã PAID hoàn toàn (tránh phá lịch sử thanh toán).
        if (bill.getStatus() == BillStatus.PAID) {
            throw new AppException(ErrorCode.BILL_CANCEL_NOT_ALLOWED);
        }

        List<PaymentAllocation> allocations = paymentAllocationRepository.findByBillId(bill.getId());
        BigDecimal netAllocated = paymentAllocationRepository.sumAllocatedByBillId(bill.getId());
        if (netAllocated != null && netAllocated.signum() > 0 && allocations != null && !allocations.isEmpty()) {
            // Reverse theo từng payment dựa trên net amount để tránh reverse lặp.
            Map<Integer, BigDecimal> netByPaymentId = new LinkedHashMap<>();
            Map<Integer, Payment> paymentById = new LinkedHashMap<>();
            for (PaymentAllocation allocation : allocations) {
                if (allocation.getPayment() == null) {
                    continue;
                }
                Integer paymentId = allocation.getPayment().getId();
                if (paymentId == null) {
                    continue;
                }
                paymentById.putIfAbsent(paymentId, allocation.getPayment());
                BigDecimal amount = allocation.getAmount() != null ? allocation.getAmount() : BigDecimal.ZERO;
                netByPaymentId.merge(paymentId, amount, BigDecimal::add);
            }

            User currentUser = SecurityUtils.getCurrentUser();
            List<PaymentAllocation> reversals = new ArrayList<>();
            for (Map.Entry<Integer, BigDecimal> entry : netByPaymentId.entrySet()) {
                BigDecimal net = entry.getValue();
                if (net == null || net.signum() <= 0) {
                    continue;
                }
                Payment payment = paymentById.get(entry.getKey());
                if (payment == null) {
                    continue;
                }
                // Tạo bản ghi reverse để giữ lịch sử (amount âm).
                reversals.add(PaymentAllocation.builder()
                        .payment(payment)
                        .bill(bill)
                        .amount(net.negate())
                        .allocationType(PaymentAllocationType.REVERSAL)
                        .note("Huy hoa don")
                        .createdBy(currentUser)
                        .build());
            }
            if (!reversals.isEmpty()) {
                paymentAllocationRepository.saveAll(reversals);
                // Cập nhật lại trạng thái payment theo số tiền đã phân bổ còn lại.
                for (Payment payment : paymentById.values()) {
                    refreshPaymentStatus(payment);
                }
                paymentRepository.saveAll(paymentById.values());
            }
        }

        bill.setStatus(BillStatus.CANCELLED);
        bill.setPaymentDate(null);
        billRepository.save(bill);
        return billMapper.toResponse(bill);
    }

    private void refreshPaymentStatus(Payment payment) {
        if (payment == null) {
            return;
        }

        BigDecimal allocated = paymentAllocationRepository.sumAllocatedByPaymentId(payment.getId());
        BigDecimal total = payment.getAmount() != null ? payment.getAmount() : BigDecimal.ZERO;
        if (allocated == null) {
            allocated = BigDecimal.ZERO;
        }

        if (payment.getStatus() == PaymentStatus.REVERSED || payment.getStatus() == PaymentStatus.FAILED) {
            return;
        }

        if (allocated.signum() <= 0) {
            payment.setStatus(
                    payment.getStatus() == PaymentStatus.PENDING ? PaymentStatus.PENDING : PaymentStatus.CONFIRMED);
            return;
        }

        int cmp = allocated.compareTo(total);
        if (cmp == 0) {
            payment.setStatus(PaymentStatus.FULLY_ALLOCATED);
        } else if (cmp > 0) {
            payment.setStatus(PaymentStatus.OVERPAID);
        } else {
            payment.setStatus(PaymentStatus.PARTIALLY_ALLOCATED);
        }
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

    private void validateBillAccess(Bill bill) {
        SecurityUtils.SpecificationSafeUser safe = SecurityUtils.safeUser();
        if (safe.isAdmin()) {
            return;
        }

        Integer ownerId = bill.getRoom() != null
                        && bill.getRoom().getBoardingHouse() != null
                        && bill.getRoom().getBoardingHouse().getOwner() != null
                ? bill.getRoom().getBoardingHouse().getOwner().getId()
                : null;

        if (ownerId == null || safe.getId() == null || !ownerId.equals(safe.getId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
    }

    private void validateUpdateRequest(Bill bill, BillRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.BILL_UPDATE_NOT_ALLOWED);
        }
        if (request.getContractId() != null
                && bill.getContract() != null
                && bill.getContract().getId() != null
                && !bill.getContract().getId().equals(request.getContractId())) {
            // Không cho phép đổi hợp đồng của hóa đơn.
            throw new AppException(ErrorCode.BILL_UPDATE_NOT_ALLOWED);
        }

        LocalDate dueDate = request.getDueDate();
        if (dueDate == null) {
            throw new AppException(ErrorCode.BILL_DUE_DATE_INVALID);
        }

        if (bill.getBillingPeriodStart() != null && dueDate.isBefore(bill.getBillingPeriodStart())) {
            throw new AppException(ErrorCode.BILL_DUE_DATE_INVALID);
        }
        if (bill.getContract() != null
                && bill.getContract().getStartDate() != null
                && dueDate.isBefore(bill.getContract().getStartDate())) {
            throw new AppException(ErrorCode.BILL_DUE_DATE_INVALID);
        }
        if (bill.getContract() != null
                && bill.getContract().getEndDate() != null
                && dueDate.isAfter(bill.getContract().getEndDate())) {
            throw new AppException(ErrorCode.BILL_DUE_DATE_INVALID);
        }
    }

    private void refreshStatusAfterDueDateChange(Bill bill) {
        if (bill == null || bill.getStatus() == null) {
            return;
        }
        if (bill.getStatus() == BillStatus.PAID || bill.getStatus() == BillStatus.CANCELLED) {
            return;
        }

        BigDecimal allocated = paymentAllocationRepository.sumAllocatedByBillId(bill.getId());
        if (allocated == null) {
            allocated = BigDecimal.ZERO;
        }
        BigDecimal total = bill.getAmount() != null ? bill.getAmount() : BigDecimal.ZERO;
        BigDecimal outstanding = total.subtract(allocated);

        if (outstanding.signum() <= 0) {
            return;
        }

        LocalDate today = LocalDate.now();
        if (bill.getDueDate() != null && bill.getDueDate().isBefore(today)) {
            bill.setStatus(BillStatus.OVERDUE);
        } else {
            bill.setStatus(allocated.signum() > 0 ? BillStatus.PARTIALLY_PAID : BillStatus.UNPAID);
        }
    }

    private String resolveNoteForUpdate(BillRequest request) {
        if (request == null) {
            return null;
        }
        if (request.getNote() != null) {
            return request.getNote();
        }

        String publicNote = request.getPublicNote();
        String internalNote = request.getInternalNote();
        if ((publicNote == null || publicNote.isBlank()) && (internalNote == null || internalNote.isBlank())) {
            return null;
        }

        StringBuilder sb = new StringBuilder();
        if (publicNote != null && !publicNote.isBlank()) {
            sb.append(publicNote.trim());
        }
        if (internalNote != null && !internalNote.isBlank()) {
            if (sb.length() > 0) {
                sb.append("\n\n");
            }
            sb.append("[INTERNAL] ").append(internalNote.trim());
        }
        return sb.toString();
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
