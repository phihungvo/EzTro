package carevn.luv2code.ez_tro.service.admin.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Date;
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

import com.google.gson.Gson;

import carevn.luv2code.ez_tro.dto.requests.BillRequest;
import carevn.luv2code.ez_tro.dto.requests.BillSendRequest;
import carevn.luv2code.ez_tro.dto.requests.InvoiceFinalizeRequest;
import carevn.luv2code.ez_tro.dto.response.BillAllocationDetailResponse;
import carevn.luv2code.ez_tro.dto.response.BillDetailResponse;
import carevn.luv2code.ez_tro.dto.response.BillLineDetailResponse;
import carevn.luv2code.ez_tro.dto.response.BillResponse;
import carevn.luv2code.ez_tro.dto.response.BillTimelineEventResponse;
import carevn.luv2code.ez_tro.dto.response.BillingOperationLogResponse;
import carevn.luv2code.ez_tro.dto.response.InvoiceBalanceResponse;
import carevn.luv2code.ez_tro.entity.Bill;
import carevn.luv2code.ez_tro.entity.BillLine;
import carevn.luv2code.ez_tro.entity.BoardingHouse;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.Organization;
import carevn.luv2code.ez_tro.entity.Payment;
import carevn.luv2code.ez_tro.entity.PaymentAllocation;
import carevn.luv2code.ez_tro.entity.Tenant;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.BillDeliveryStatus;
import carevn.luv2code.ez_tro.enums.BillLifecycleStatus;
import carevn.luv2code.ez_tro.enums.BillStatus;
import carevn.luv2code.ez_tro.enums.BillTimelineEventType;
import carevn.luv2code.ez_tro.enums.BillingOperationType;
import carevn.luv2code.ez_tro.enums.ContractStatus;
import carevn.luv2code.ez_tro.enums.InvoiceType;
import carevn.luv2code.ez_tro.enums.PaymentAllocationType;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.BillMapper;
import carevn.luv2code.ez_tro.repository.BillRepository;
import carevn.luv2code.ez_tro.repository.ContractRepository;
import carevn.luv2code.ez_tro.repository.PaymentAllocationRepository;
import carevn.luv2code.ez_tro.repository.PaymentRepository;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.BillService;
import carevn.luv2code.ez_tro.service.admin.BillingOperationLogService;
import carevn.luv2code.ez_tro.service.admin.BillingOrchestratorService;
import carevn.luv2code.ez_tro.service.admin.NotificationService;
import carevn.luv2code.ez_tro.service.admin.PaymentAllocationService;
import carevn.luv2code.ez_tro.service.admin.payment.InvoiceBalanceCalculator;
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
    private final BillingOperationLogService billingOperationLogService;
    private final InvoiceBalanceCalculator invoiceBalanceCalculator;
    private final NotificationService notificationService;
    private final PaymentAllocationService paymentAllocationService;
    private final Gson gson = new Gson();

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
    @Transactional
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
                .paymentInstructions(request.getPaymentInstructions())
                .build();

        BillResponse response = billingOrchestratorService.finalizeInvoice(finalizeRequest);
        Bill createdBill = billRepository.findById(response.getId()).orElse(null);
        billingOperationLogService.logBillOperation(
                BillingOperationType.BILL_CREATE,
                contract,
                response.getId(),
                null,
                billingOperationLogService.snapshotBill(createdBill),
                buildBillAuditMetadata("CREATE", request));
        return response;
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
    @Transactional
    public BillResponse update(Integer id, BillRequest request) {
        Bill bill = billRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));

        validateBillAccess(bill);
        validateUpdateRequest(bill, request);
        Map<String, Object> beforeState = billingOperationLogService.snapshotBill(bill);

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

        String publicNote = resolvePublicNoteForUpdate(bill, request);
        if (publicNote != null) {
            bill.setPublicNote(publicNote);
        }

        String internalNote = resolveInternalNoteForUpdate(bill, request);
        if (internalNote != null) {
            bill.setInternalNote(internalNote);
            bill.setNote(internalNote);
        }

        String paymentInstructions = resolvePaymentInstructionsForUpdate(bill, request);
        if (paymentInstructions != null) {
            bill.setPaymentInstructions(paymentInstructions);
        }

        billRepository.save(bill);
        billingOperationLogService.logBillOperation(
                BillingOperationType.BILL_UPDATE,
                bill.getContract(),
                bill.getId(),
                beforeState,
                billingOperationLogService.snapshotBill(bill),
                buildBillAuditMetadata("UPDATE", request));
        return billMapper.toResponse(bill);
    }

    @Override
    @Transactional
    public BillResponse send(Integer id, BillSendRequest request) {
        Bill bill = billRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));
        validateBillAccess(bill);

        if (bill.getStatus() == BillStatus.CANCELLED) {
            throw new AppException(ErrorCode.BILL_SEND_NOT_ALLOWED);
        }

        BillSendRequest effectiveRequest =
                request != null ? request : BillSendRequest.builder().build();
        if (bill.getSentAt() != null && !Boolean.TRUE.equals(effectiveRequest.getResend())) {
            return billMapper.toResponse(bill);
        }

        boolean sendInApp = Boolean.TRUE.equals(effectiveRequest.getSendInApp());
        boolean sendEmail = Boolean.TRUE.equals(effectiveRequest.getSendEmail());
        boolean sendSms = Boolean.TRUE.equals(effectiveRequest.getSendSms());
        boolean sendZalo = Boolean.TRUE.equals(effectiveRequest.getSendZalo());
        if (!sendInApp && !sendEmail && !sendSms && !sendZalo) {
            throw new AppException(ErrorCode.BILL_SEND_CHANNEL_REQUIRED);
        }

        Map<String, Object> beforeState = billingOperationLogService.snapshotBill(bill);
        List<String> requestedChannels = new ArrayList<>();
        List<String> deliveredChannels = new ArrayList<>();
        List<String> unsupportedChannels = new ArrayList<>();

        if (sendInApp) {
            requestedChannels.add("IN_APP");
            if (bill.getTenant() != null
                    && bill.getTenant().getUser() != null
                    && bill.getTenant().getUser().getId() != null) {
                Map<String, Object> notificationData = new LinkedHashMap<>();
                notificationData.put("billId", bill.getId());
                notificationData.put("billCode", bill.getBillCode());
                notificationData.put("amount", bill.getAmount());
                //                notificationData.put("dueDate", bill.getDueDate());

                notificationData.put(
                        "dueDate", bill.getDueDate() != null ? bill.getDueDate().toString() : null);

                notificationData.put(
                        "roomNumber", bill.getRoom() != null ? bill.getRoom().getRoomNumber() : null);
                notificationService.sendToUser(
                        bill.getTenant().getUser().getId(),
                        "Hóa đơn đã được phát hành",
                        buildBillSendMessage(bill),
                        "BILL_SENT",
                        notificationData);
                deliveredChannels.add("IN_APP");

                User actor = SecurityUtils.getCurrentUser();
                User owner = bill.getRoom() != null && bill.getRoom().getBoardingHouse() != null
                        ? bill.getRoom().getBoardingHouse().getOwner()
                        : null;
                if (owner != null
                        && owner.getId() != null
                        && actor != null
                        && SecurityUtils.isAdmin()
                        && !owner.getId().equals(actor.getId())) {
                    Map<String, Object> ownerData = new LinkedHashMap<>(notificationData);
                    ownerData.put(
                            "tenantName",
                            bill.getTenant() != null && bill.getTenant().getUser() != null
                                    ? bill.getTenant().getUser().getFullName()
                                    : null);
                    ownerData.put("dedupeKey", "owner-bill-sent-" + bill.getId() + "-" + System.currentTimeMillis());
                    notificationService.sendToUser(
                            owner.getId(),
                            "Hóa đơn đã được gửi",
                            "Admin đã gửi hóa đơn "
                                    + (bill.getBillCode() != null ? bill.getBillCode() : ("#" + bill.getId()))
                                    + " cho phòng " + bill.getRoom().getRoomNumber() + ".",
                            "OWNER_BILL_SENT",
                            ownerData);
                }
            }
        }

        if (sendEmail) {
            requestedChannels.add("EMAIL");
            unsupportedChannels.add("EMAIL");
        }
        if (sendSms) {
            requestedChannels.add("SMS");
            unsupportedChannels.add("SMS");
        }
        if (sendZalo) {
            requestedChannels.add("ZALO");
            unsupportedChannels.add("ZALO");
        }

        Date sendTimestamp = new Date();
        BillDeliveryStatus deliveryStatus = resolveDeliveryStatus(deliveredChannels, unsupportedChannels);
        bill.setDeliveryStatus(deliveryStatus);
        if (bill.getIssuedAt() == null) {
            bill.setIssuedAt(bill.getCreatedAt() != null ? bill.getCreatedAt() : sendTimestamp);
        }
        if (deliveryStatus == BillDeliveryStatus.FAILED) {
            if (bill.getLifecycleStatus() == null || bill.getLifecycleStatus() == BillLifecycleStatus.ISSUED) {
                bill.setLifecycleStatus(BillLifecycleStatus.ISSUED);
            }
        } else {
            bill.setSentAt(sendTimestamp);
            bill.setLifecycleStatus(BillLifecycleStatus.SENT);
        }
        bill.setDeliveryChannelsJson(gson.toJson(Map.of(
                "requestedChannels", requestedChannels,
                "deliveredChannels", deliveredChannels,
                "unsupportedChannels", unsupportedChannels,
                "resend", Boolean.TRUE.equals(effectiveRequest.getResend()))));
        billRepository.save(bill);

        billingOperationLogService.logBillOperation(
                BillingOperationType.BILL_SEND,
                bill.getContract(),
                bill.getId(),
                beforeState,
                billingOperationLogService.snapshotBill(bill),
                buildBillSendAuditMetadata(
                        effectiveRequest, requestedChannels, deliveredChannels, unsupportedChannels));
        return billMapper.toResponse(bill);
    }

    /**
     * Xóa bill theo id.
     *
     * @param id id bill
     */
    @Override
    @Transactional
    public void delete(Integer id) {
        Bill bill = billRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));
        validateBillAccess(bill);
        Map<String, Object> beforeState = billingOperationLogService.snapshotBill(bill);
        // Không cho hard delete bill đã persist vào hệ thống; production flow chỉ cho cancel/void.
        if (resolveLifecycleStatus(bill) != null) {
            throw new AppException(ErrorCode.BILL_DELETE_NOT_ALLOWED);
        }
        BigDecimal allocated = paymentAllocationRepository.sumAllocatedByBillId(bill.getId());
        if (allocated != null && allocated.signum() != 0) {
            throw new AppException(ErrorCode.BILL_DELETE_NOT_ALLOWED);
        }
        Contract contract = bill.getContract();
        billRepository.delete(bill);
        billingOperationLogService.logBillOperation(
                BillingOperationType.BILL_DELETE, contract, id, beforeState, null, Map.of("hardDelete", true));
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
        Map<String, Object> beforeState = billingOperationLogService.snapshotBill(bill);

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
        int reversalCount = 0;
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
                reversalCount = reversals.size();
                for (Payment payment : paymentById.values()) {
                    paymentAllocationService.syncPaymentDerivedState(
                            payment.getId(), "Huy hoa don " + bill.getBillCode());
                }
            }
        }

        bill.setStatus(BillStatus.CANCELLED);
        bill.setLifecycleStatus(BillLifecycleStatus.CANCELLED);
        bill.setPaymentDate(null);
        billRepository.save(bill);
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("reversalCount", reversalCount);
        metadata.put("reversedNetAllocated", netAllocated);
        billingOperationLogService.logBillOperation(
                BillingOperationType.BILL_CANCEL,
                bill.getContract(),
                bill.getId(),
                beforeState,
                billingOperationLogService.snapshotBill(bill),
                metadata);
        return billMapper.toResponse(bill);
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
        validateBillAccess(bill);
        return billMapper.toResponse(bill);
    }

    @Override
    @Transactional(readOnly = true)
    public BillDetailResponse getDetail(Integer id) {
        Bill bill = billRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));
        validateBillAccess(bill);
        return toBillDetailResponse(bill, true);
    }

    /**
     * Lấy tất cả bill (không phân trang).
     *
     * @return danh sách bill DTO
     */
    @Override
    public List<BillResponse> getAll() {
        SecurityUtils.SpecificationSafeUser safe = SecurityUtils.safeUser();
        Specification<Bill> spec = safe.isAdmin() ? Specification.where(null) : BillSpecs.ownedByOwner(safe.get());
        return billRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(billMapper::toResponse)
                .toList();
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

    private String resolvePublicNoteForUpdate(Bill bill, BillRequest request) {
        if (request == null) {
            return null;
        }
        if (request.getPublicNote() != null) {
            return normalizeText(request.getPublicNote());
        }
        return bill.getPublicNote();
    }

    private String resolveInternalNoteForUpdate(Bill bill, BillRequest request) {
        if (request == null) {
            return null;
        }
        if (request.getInternalNote() != null) {
            return normalizeText(request.getInternalNote());
        }
        if (request.getNote() != null) {
            return normalizeText(request.getNote());
        }
        return bill.getInternalNote() != null ? bill.getInternalNote() : normalizeText(bill.getNote());
    }

    private String resolvePaymentInstructionsForUpdate(Bill bill, BillRequest request) {
        if (request == null) {
            return null;
        }
        if (request.getPaymentInstructions() != null) {
            return normalizeText(request.getPaymentInstructions());
        }
        return bill.getPaymentInstructions();
    }

    public BillDetailResponse toBillDetailResponse(Bill bill, boolean includeAuditLogs) {
        return toBillDetailResponse(bill, includeAuditLogs, true);
    }

    public BillDetailResponse toBillDetailResponse(Bill bill, boolean includeAuditLogs, boolean includeInternalNote) {
        if (bill == null) {
            return null;
        }

        InvoiceBalanceResponse balance = invoiceBalanceCalculator.calculate(bill);
        NoteParts noteParts = resolveBillNoteParts(bill);
        List<BillLineDetailResponse> lines = bill.getLines() == null
                ? List.of()
                : bill.getLines().stream().map(this::toBillLineDetailResponse).toList();
        List<BillAllocationDetailResponse> allocations = paymentAllocationRepository.findByBillId(bill.getId()).stream()
                .sorted((left, right) -> {
                    if (left.getCreatedAt() == null && right.getCreatedAt() == null) {
                        return Integer.compare(left.getId(), right.getId());
                    }
                    if (left.getCreatedAt() == null) {
                        return 1;
                    }
                    if (right.getCreatedAt() == null) {
                        return -1;
                    }
                    int byCreatedAt = right.getCreatedAt().compareTo(left.getCreatedAt());
                    return byCreatedAt != 0 ? byCreatedAt : Integer.compare(right.getId(), left.getId());
                })
                .map(this::toBillAllocationDetailResponse)
                .toList();
        List<BillingOperationLogResponse> auditLogs = includeAuditLogs
                ? billingOperationLogService.getLogs(
                        bill.getContract() != null ? bill.getContract().getId() : null,
                        carevn.luv2code.ez_tro.enums.BillingAuditTargetType.BILL,
                        bill.getId())
                : List.of();
        List<Payment> relatedPayments =
                bill.getContract() != null && bill.getContract().getId() != null
                        ? paymentRepository.findByContractIdOrderByReceivedAtAsc(
                                bill.getContract().getId())
                        : List.of();
        List<BillTimelineEventResponse> timeline = buildTimelineEvents(bill, allocations, auditLogs, relatedPayments);

        return BillDetailResponse.builder()
                .id(bill.getId())
                .billCode(bill.getBillCode())
                .billTitle(bill.getBillTitle())
                .contractId(bill.getContract() != null ? bill.getContract().getId() : null)
                .contractCode(bill.getContract() != null ? bill.getContract().getContractCode() : null)
                .roomId(bill.getRoom() != null ? bill.getRoom().getId() : null)
                .roomNumber(bill.getRoom() != null ? bill.getRoom().getRoomNumber() : null)
                .roomMaxOccupants(bill.getRoom() != null ? bill.getRoom().getMaxOccupants() : null)
                .tenantId(bill.getTenant() != null ? bill.getTenant().getId() : null)
                .tenantName(resolveTenantName(bill))
                .tenantPhone(resolveTenantPhone(bill))
                .tenantEmail(resolveTenantEmail(bill))
                .tenantIdentityNumber(
                        bill.getTenant() != null
                                ? normalizeText(bill.getTenant().getIdentityNumber())
                                : null)
                .boardingHouseName(resolveBoardingHouseName(bill))
                .boardingHouseAddress(resolveBoardingHouseAddress(bill))
                .boardingHousePhone(resolveBoardingHousePhone(bill))
                .ownerName(resolveOwnerName(bill))
                .ownerPhone(resolveOwnerPhone(bill))
                .ownerEmail(resolveOwnerEmail(bill))
                .ownerAddress(resolveOwnerAddress(bill))
                .organizationName(resolveOrganizationName(bill))
                .invoiceType(bill.getInvoiceType())
                .billingPeriodStart(bill.getBillingPeriodStart())
                .billingPeriodEnd(bill.getBillingPeriodEnd())
                .dueDate(bill.getDueDate())
                .paymentDate(bill.getPaymentDate())
                .amount(bill.getAmount())
                .serviceAmount(bill.getServiceAmount())
                .allocatedAmount(balance.getAllocatedAmount())
                .outstandingAmount(balance.getOutstandingAmount())
                .overpaidAmount(balance.getOverpaidAmount())
                .paymentStatus(balance.getPaymentStatus())
                .status(bill.getStatus())
                .lifecycleStatus(resolveLifecycleStatus(bill))
                .deliveryStatus(bill.getDeliveryStatus())
                .publicNote(noteParts.publicNote())
                .internalNote(includeInternalNote ? noteParts.internalNote() : null)
                .paymentInstructions(normalizeText(bill.getPaymentInstructions()))
                .deliveryChannelsJson(bill.getDeliveryChannelsJson())
                .issuedAt(resolveIssuedAt(bill))
                .sentAt(bill.getSentAt())
                .createdAt(bill.getCreatedAt())
                .updatedAt(bill.getUpdatedAt())
                .lines(lines)
                .allocations(allocations)
                .timeline(timeline)
                .auditLogs(auditLogs)
                .build();
    }

    private BillLineDetailResponse toBillLineDetailResponse(BillLine line) {
        return BillLineDetailResponse.builder()
                .id(line.getId())
                .lineType(line.getLineType())
                .lineKey(line.getLineKey())
                .description(line.getDescription())
                .quantity(line.getQuantity())
                .unitPrice(line.getUnitPrice())
                .amount(line.getAmount())
                .utilityId(line.getUtilityId())
                .metadataJson(line.getMetadataJson())
                .createdAt(line.getCreatedAt())
                .build();
    }

    private BillAllocationDetailResponse toBillAllocationDetailResponse(PaymentAllocation allocation) {
        Payment payment = allocation.getPayment();
        Map<String, Object> paymentMetadata =
                payment != null ? parsePaymentMetadata(payment.getMetadataJson()) : Map.of();
        return BillAllocationDetailResponse.builder()
                .id(allocation.getId())
                .paymentId(payment != null ? payment.getId() : null)
                .externalReference(payment != null ? payment.getExternalReference() : null)
                .paymentSource(payment != null ? payment.getSource() : null)
                .paymentStatus(payment != null ? payment.getStatus() : null)
                .paymentMethod(metadataString(paymentMetadata, "paymentMethod"))
                .amount(allocation.getAmount())
                .allocationType(allocation.getAllocationType())
                .note(allocation.getNote())
                .receivedAt(payment != null ? payment.getReceivedAt() : null)
                .confirmedAt(payment != null ? payment.getConfirmedAt() : null)
                .createdAt(allocation.getCreatedAt())
                .build();
    }

    private String resolveTenantName(Bill bill) {
        if (bill.getTenant() == null || bill.getTenant().getUser() == null) {
            return null;
        }
        User user = bill.getTenant().getUser();
        if (user.getFullName() != null && !user.getFullName().isBlank()) {
            return user.getFullName();
        }
        String fullName = ((user.getFirstName() != null ? user.getFirstName() : "")
                        + " "
                        + (user.getLastName() != null ? user.getLastName() : ""))
                .trim();
        return fullName.isBlank() ? user.getUsername() : fullName;
    }

    private String resolveTenantPhone(Bill bill) {
        if (bill == null || bill.getTenant() == null || bill.getTenant().getUser() == null) {
            return null;
        }
        return normalizeText(bill.getTenant().getUser().getPhoneNumber());
    }

    private String resolveTenantEmail(Bill bill) {
        if (bill == null || bill.getTenant() == null || bill.getTenant().getUser() == null) {
            return null;
        }
        return normalizeText(bill.getTenant().getUser().getEmail());
    }

    private String resolveBoardingHouseName(Bill bill) {
        BoardingHouse boardingHouse = resolveBoardingHouse(bill);
        return boardingHouse != null ? normalizeText(boardingHouse.getName()) : null;
    }

    private String resolveBoardingHouseAddress(Bill bill) {
        BoardingHouse boardingHouse = resolveBoardingHouse(bill);
        return boardingHouse != null ? normalizeText(boardingHouse.getAddress()) : null;
    }

    private String resolveBoardingHousePhone(Bill bill) {
        BoardingHouse boardingHouse = resolveBoardingHouse(bill);
        return boardingHouse != null ? normalizeText(boardingHouse.getContactPhone()) : null;
    }

    private String resolveOwnerName(Bill bill) {
        User owner = resolveOwner(bill);
        return owner != null ? resolveUserDisplayName(owner) : null;
    }

    private String resolveOwnerPhone(Bill bill) {
        User owner = resolveOwner(bill);
        return owner != null ? normalizeText(owner.getPhoneNumber()) : null;
    }

    private String resolveOwnerEmail(Bill bill) {
        User owner = resolveOwner(bill);
        return owner != null ? normalizeText(owner.getEmail()) : null;
    }

    private String resolveOwnerAddress(Bill bill) {
        User owner = resolveOwner(bill);
        return owner != null ? normalizeText(owner.getAddress()) : null;
    }

    private String resolveOrganizationName(Bill bill) {
        Organization organization = resolveOrganization(bill);
        return organization != null ? normalizeText(organization.getName()) : null;
    }

    private BoardingHouse resolveBoardingHouse(Bill bill) {
        if (bill == null || bill.getRoom() == null) {
            return null;
        }
        return bill.getRoom().getBoardingHouse();
    }

    private Organization resolveOrganization(Bill bill) {
        BoardingHouse boardingHouse = resolveBoardingHouse(bill);
        if (boardingHouse != null && boardingHouse.getOrganization() != null) {
            return boardingHouse.getOrganization();
        }
        if (bill == null || bill.getContract() == null) {
            return null;
        }
        return bill.getContract().getOrganization();
    }

    private User resolveOwner(Bill bill) {
        BoardingHouse boardingHouse = resolveBoardingHouse(bill);
        if (boardingHouse != null && boardingHouse.getOwner() != null) {
            return boardingHouse.getOwner();
        }
        if (bill == null || bill.getTenant() == null) {
            return null;
        }
        return bill.getTenant().getOwner();
    }

    private String resolveUserDisplayName(User user) {
        if (user == null) {
            return null;
        }
        if (user.getFullName() != null && !user.getFullName().isBlank()) {
            return user.getFullName().trim();
        }
        String fullName = ((user.getFirstName() != null ? user.getFirstName() : "")
                        + " "
                        + (user.getLastName() != null ? user.getLastName() : ""))
                .trim();
        return fullName.isBlank() ? user.getUsername() : fullName;
    }

    private NoteParts resolveBillNoteParts(Bill bill) {
        if (bill == null) {
            return new NoteParts(null, null);
        }

        String publicNote = normalizeText(bill.getPublicNote());
        String internalNote = normalizeText(bill.getInternalNote());
        if (publicNote != null || internalNote != null) {
            return new NoteParts(publicNote, internalNote);
        }

        return splitLegacyBillNote(bill.getNote());
    }

    private NoteParts splitLegacyBillNote(String note) {
        if (note == null || note.isBlank()) {
            return new NoteParts(null, null);
        }

        String marker = "[INTERNAL]";
        int markerIndex = note.indexOf(marker);
        if (markerIndex < 0) {
            return new NoteParts(null, normalizeText(note));
        }

        String publicNote = note.substring(0, markerIndex).trim();
        String internalNote = note.substring(markerIndex + marker.length()).trim();
        return new NoteParts(publicNote.isBlank() ? null : publicNote, internalNote.isBlank() ? null : internalNote);
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private record NoteParts(String publicNote, String internalNote) {}

    public BillLifecycleStatus resolveLifecycleStatus(Bill bill) {
        if (bill == null) {
            return null;
        }
        if (bill.getLifecycleStatus() != null) {
            return bill.getLifecycleStatus();
        }
        if (bill.getStatus() == BillStatus.CANCELLED) {
            return BillLifecycleStatus.CANCELLED;
        }
        if (bill.getSentAt() != null) {
            return BillLifecycleStatus.SENT;
        }
        if (bill.getId() != null || bill.getCreatedAt() != null) {
            return BillLifecycleStatus.ISSUED;
        }
        return null;
    }

    public Date resolveIssuedAt(Bill bill) {
        if (bill == null) {
            return null;
        }
        if (bill.getIssuedAt() != null) {
            return bill.getIssuedAt();
        }
        return resolveLifecycleStatus(bill) == null ? null : bill.getCreatedAt();
    }

    private List<BillTimelineEventResponse> buildTimelineEvents(
            Bill bill,
            List<BillAllocationDetailResponse> allocations,
            List<BillingOperationLogResponse> auditLogs,
            List<Payment> relatedPayments) {
        List<BillTimelineEventResponse> events = new ArrayList<>();
        boolean hasIssuedEvent = false;
        boolean hasSendEvent = false;
        boolean hasCancelledEvent = false;

        for (BillingOperationLogResponse log : auditLogs) {
            if (log == null || log.getOperationType() == null) {
                continue;
            }

            switch (log.getOperationType()) {
                case BILL_CREATE -> {
                    events.add(BillTimelineEventResponse.builder()
                            .eventKey("audit-" + log.getId())
                            .eventType(BillTimelineEventType.ISSUED)
                            .title("Phát hành hóa đơn")
                            .description("Hóa đơn đã được tạo và chốt kỳ tính.")
                            .actorName(log.getActorName())
                            .occurredAt(log.getCreatedAt())
                            .build());
                    hasIssuedEvent = true;
                }
                case BILL_SEND -> {
                    BillTimelineEventType eventType = resolveSendTimelineType(log, bill);
                    events.add(BillTimelineEventResponse.builder()
                            .eventKey("audit-" + log.getId())
                            .eventType(eventType)
                            .title(
                                    eventType == BillTimelineEventType.SEND_FAILED
                                            ? "Gửi hóa đơn thất bại"
                                            : "Gửi hóa đơn")
                            .description(buildSendTimelineDescription(log))
                            .actorName(log.getActorName())
                            .occurredAt(log.getCreatedAt())
                            .build());
                    hasSendEvent = true;
                }
                case BILL_UPDATE -> events.add(BillTimelineEventResponse.builder()
                        .eventKey("audit-" + log.getId())
                        .eventType(BillTimelineEventType.UPDATED)
                        .title("Cập nhật hóa đơn")
                        .description("Thông tin hóa đơn đã được cập nhật.")
                        .actorName(log.getActorName())
                        .occurredAt(log.getCreatedAt())
                        .build());
                case BILL_CANCEL -> {
                    events.add(BillTimelineEventResponse.builder()
                            .eventKey("audit-" + log.getId())
                            .eventType(BillTimelineEventType.CANCELLED)
                            .title("Hủy hóa đơn")
                            .description("Hóa đơn đã được hủy và các phân bổ liên quan được xử lý theo rule.")
                            .actorName(log.getActorName())
                            .occurredAt(log.getCreatedAt())
                            .build());
                    hasCancelledEvent = true;
                }
                default -> {
                    // Timeline bill chỉ bề mặt hóa các event vận hành chính.
                }
            }
        }

        if (!hasIssuedEvent && resolveIssuedAt(bill) != null) {
            events.add(BillTimelineEventResponse.builder()
                    .eventKey("issued-" + bill.getId())
                    .eventType(BillTimelineEventType.ISSUED)
                    .title("Phát hành hóa đơn")
                    .description("Hóa đơn đã được issue vào hệ thống.")
                    .occurredAt(resolveIssuedAt(bill))
                    .build());
        }

        if (!hasSendEvent && bill.getSentAt() != null) {
            events.add(BillTimelineEventResponse.builder()
                    .eventKey("sent-" + bill.getId())
                    .eventType(BillTimelineEventType.SENT)
                    .title("Gửi hóa đơn")
                    .description("Hóa đơn đã được gửi tới tenant.")
                    .occurredAt(bill.getSentAt())
                    .build());
        }

        for (Payment payment : relatedPayments) {
            if (!belongsToBill(payment, bill)) {
                continue;
            }
            events.add(BillTimelineEventResponse.builder()
                    .eventKey("payment-submitted-" + payment.getId())
                    .eventType(BillTimelineEventType.PAYMENT_SUBMITTED)
                    .title(resolvePaymentSubmissionTitle(payment))
                    .description(buildPaymentSubmissionDescription(payment))
                    .actorName(
                            payment.getCreatedBy() != null
                                    ? payment.getCreatedBy().getFullName()
                                    : null)
                    .amount(payment.getAmount())
                    .occurredAt(payment.getReceivedAt() != null ? payment.getReceivedAt() : payment.getCreatedAt())
                    .build());
        }

        for (BillAllocationDetailResponse allocation : allocations) {
            if (allocation == null || allocation.getCreatedAt() == null) {
                continue;
            }
            boolean reversed =
                    allocation.getAmount() != null && allocation.getAmount().signum() < 0;
            if (allocation.getAllocationType() == PaymentAllocationType.REVERSAL) {
                reversed = true;
            }
            events.add(BillTimelineEventResponse.builder()
                    .eventKey("allocation-" + allocation.getId())
                    .eventType(
                            reversed ? BillTimelineEventType.PAYMENT_REVERSED : BillTimelineEventType.PAYMENT_ALLOCATED)
                    .title(reversed ? "Reverse phân bổ thanh toán" : "Phân bổ thanh toán")
                    .description(buildAllocationTimelineDescription(allocation, reversed))
                    .amount(allocation.getAmount())
                    .occurredAt(allocation.getCreatedAt())
                    .build());
        }

        if (!hasCancelledEvent && bill.getStatus() == BillStatus.CANCELLED && bill.getUpdatedAt() != null) {
            events.add(BillTimelineEventResponse.builder()
                    .eventKey("cancelled-" + bill.getId())
                    .eventType(BillTimelineEventType.CANCELLED)
                    .title("Hủy hóa đơn")
                    .description("Hóa đơn ở trạng thái hủy.")
                    .occurredAt(bill.getUpdatedAt())
                    .build());
        }

        events.sort((left, right) -> {
            Date leftAt = left.getOccurredAt();
            Date rightAt = right.getOccurredAt();
            if (leftAt == null && rightAt == null) {
                return String.valueOf(right.getEventKey()).compareTo(String.valueOf(left.getEventKey()));
            }
            if (leftAt == null) {
                return 1;
            }
            if (rightAt == null) {
                return -1;
            }
            int byDate = rightAt.compareTo(leftAt);
            if (byDate != 0) {
                return byDate;
            }
            return String.valueOf(right.getEventKey()).compareTo(String.valueOf(left.getEventKey()));
        });
        return events;
    }

    private BillTimelineEventType resolveSendTimelineType(BillingOperationLogResponse log, Bill bill) {
        Object afterState = log != null ? log.getAfterState() : null;
        BillDeliveryStatus status = extractDeliveryStatus(afterState);
        if (status == null && bill != null) {
            status = bill.getDeliveryStatus();
        }
        return status == BillDeliveryStatus.FAILED ? BillTimelineEventType.SEND_FAILED : BillTimelineEventType.SENT;
    }

    private String buildSendTimelineDescription(BillingOperationLogResponse log) {
        Map<String, Object> details = extractDetailsMap(log != null ? log.getMetadata() : null);
        String delivered = joinTimelineChannels(details.get("deliveredChannels"));
        String unsupported = joinTimelineChannels(details.get("unsupportedChannels"));

        if (delivered != null && unsupported != null) {
            return "Đã gửi qua " + delivered + ". Các kênh còn chờ tích hợp: " + unsupported + ".";
        }
        if (delivered != null) {
            return "Đã gửi qua " + delivered + ".";
        }
        if (unsupported != null) {
            return "Đã ghi nhận yêu cầu gửi nhưng chưa có kênh deliver thành công. Kênh chờ tích hợp: " + unsupported
                    + ".";
        }
        return "Đã thực hiện thao tác gửi hóa đơn.";
    }

    private String buildAllocationTimelineDescription(BillAllocationDetailResponse allocation, boolean reversed) {
        String reference = allocation.getExternalReference();
        String paymentId = allocation.getPaymentId() != null ? "#" + allocation.getPaymentId() : null;
        String source = reference != null && !reference.isBlank()
                ? "Mã tham chiếu " + reference
                : (paymentId != null ? "Payment " + paymentId : "Không có mã tham chiếu");
        return reversed ? "Đã reverse phân bổ từ " + source + "." : "Đã phân bổ thanh toán từ " + source + ".";
    }

    private boolean belongsToBill(Payment payment, Bill bill) {
        if (payment == null || bill == null) {
            return false;
        }
        if (payment.getSource() != carevn.luv2code.ez_tro.enums.PaymentSource.TENANT_SUBMITTED) {
            return false;
        }
        if (payment.getTenant() == null
                || bill.getTenant() == null
                || payment.getTenant().getId() == null) {
            return false;
        }
        if (!payment.getTenant().getId().equals(bill.getTenant().getId())) {
            return false;
        }
        Map<String, Object> metadata = parsePaymentMetadata(payment.getMetadataJson());
        Object rawBillId = metadata.get("billId");
        if (rawBillId instanceof Number number) {
            return bill.getId() != null && Integer.valueOf(number.intValue()).equals(bill.getId());
        }
        if (rawBillId instanceof String value) {
            try {
                return bill.getId() != null && bill.getId().equals(Integer.valueOf(value));
            } catch (NumberFormatException exception) {
                return false;
            }
        }
        return false;
    }

    private String resolvePaymentSubmissionTitle(Payment payment) {
        if (payment == null || payment.getStatus() == null) {
            return "Gửi xác nhận thanh toán";
        }
        return switch (payment.getStatus()) {
            case PENDING -> "Gửi xác nhận thanh toán";
            case CONFIRMED, PARTIALLY_ALLOCATED, FULLY_ALLOCATED, OVERPAID -> "Yêu cầu thanh toán đã được tiếp nhận";
            case FAILED -> "Yêu cầu thanh toán thất bại";
            case REVERSED -> "Yêu cầu thanh toán đã bị đảo";
        };
    }

    private String buildPaymentSubmissionDescription(Payment payment) {
        Map<String, Object> metadata = parsePaymentMetadata(payment != null ? payment.getMetadataJson() : null);
        String method = metadata.get("paymentMethod") != null ? String.valueOf(metadata.get("paymentMethod")) : null;
        String reference = payment != null ? payment.getExternalReference() : null;
        String status = payment != null && payment.getStatus() != null
                ? payment.getStatus().name()
                : null;

        StringBuilder builder = new StringBuilder("Tenant đã gửi xác nhận thanh toán");
        if (method != null && !method.isBlank()) {
            builder.append(" qua ").append(method);
        }
        if (reference != null && !reference.isBlank()) {
            builder.append(". Mã tham chiếu: ").append(reference);
        }
        if (status != null) {
            builder.append(". Trạng thái payment: ").append(status);
        }
        builder.append(".");
        return builder.toString();
    }

    private BillDeliveryStatus extractDeliveryStatus(Object afterState) {
        if (!(afterState instanceof Map<?, ?> stateMap)) {
            return null;
        }
        Object raw = stateMap.get("deliveryStatus");
        if (!(raw instanceof String value) || value.isBlank()) {
            return null;
        }
        try {
            return BillDeliveryStatus.valueOf(value);
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> extractDetailsMap(Object metadata) {
        if (!(metadata instanceof Map<?, ?> metadataMap)) {
            return Map.of();
        }
        Object details = metadataMap.get("details");
        if (details instanceof Map<?, ?> detailsMap) {
            return (Map<String, Object>) detailsMap;
        }
        return (Map<String, Object>) metadataMap;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parsePaymentMetadata(String metadataJson) {
        if (metadataJson == null || metadataJson.isBlank()) {
            return Map.of();
        }
        try {
            Object parsed = gson.fromJson(metadataJson, Object.class);
            if (parsed instanceof Map<?, ?> metadataMap) {
                return (Map<String, Object>) metadataMap;
            }
        } catch (RuntimeException exception) {
            return Map.of();
        }
        return Map.of();
    }

    private String metadataString(Map<String, Object> metadata, String key) {
        if (metadata == null || key == null) {
            return null;
        }
        Object value = metadata.get(key);
        if (value == null) {
            return null;
        }
        String normalized = String.valueOf(value).trim();
        return normalized.isBlank() ? null : normalized;
    }

    private String joinTimelineChannels(Object rawChannels) {
        if (!(rawChannels instanceof List<?> channels) || channels.isEmpty()) {
            return null;
        }
        return channels.stream()
                .map(String::valueOf)
                .reduce((left, right) -> left + ", " + right)
                .orElse(null);
    }

    private String buildBillSendMessage(Bill bill) {
        String roomNumber = bill.getRoom() != null ? bill.getRoom().getRoomNumber() : "N/A";
        String amount = bill.getAmount() != null ? bill.getAmount().toPlainString() : "0";
        return "Hóa đơn " + bill.getBillCode() + " cho phòng " + roomNumber + " đã được phát hành. Tổng tiền: " + amount
                + "đ, hạn thanh toán: " + bill.getDueDate();
    }

    private BillDeliveryStatus resolveDeliveryStatus(List<String> deliveredChannels, List<String> unsupportedChannels) {
        if (deliveredChannels == null || deliveredChannels.isEmpty()) {
            return BillDeliveryStatus.FAILED;
        }
        if (unsupportedChannels != null && !unsupportedChannels.isEmpty()) {
            return BillDeliveryStatus.PARTIALLY_SENT;
        }
        return BillDeliveryStatus.SENT;
    }

    private Map<String, Object> buildBillSendAuditMetadata(
            BillSendRequest request,
            List<String> requestedChannels,
            List<String> deliveredChannels,
            List<String> unsupportedChannels) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("requestedChannels", requestedChannels);
        metadata.put("deliveredChannels", deliveredChannels);
        metadata.put("unsupportedChannels", unsupportedChannels);
        metadata.put("resend", request != null && Boolean.TRUE.equals(request.getResend()));
        return metadata;
    }

    private Map<String, Object> buildBillAuditMetadata(String action, BillRequest request) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("action", action);
        if (request == null) {
            return metadata;
        }
        metadata.put(
                "dueDate",
                request.getDueDate() == null ? null : request.getDueDate().toString());
        metadata.put("billTitle", request.getBillTitle());
        metadata.put("note", request.getNote());
        metadata.put("publicNote", request.getPublicNote());
        metadata.put("internalNote", request.getInternalNote());
        metadata.put("paymentInstructions", request.getPaymentInstructions());
        metadata.put("extraAmount", request.getExtraAmount());
        metadata.put("discountAmount", request.getDiscountAmount());
        metadata.put("discountReason", request.getDiscountReason());
        return metadata;
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
            LocalDate startDate,
            LocalDate endDate,
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

        spec = spec.and(BillSpecs.dueDateFrom(startDate));
        spec = spec.and(BillSpecs.dueDateTo(endDate));

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
