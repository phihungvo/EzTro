package carevn.luv2code.ez_tro.service.user.impl;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import carevn.luv2code.ez_tro.configuration.MinioService;
import carevn.luv2code.ez_tro.dto.FileDTO;
import carevn.luv2code.ez_tro.dto.requests.BillPaymentSubmissionRequest;
import carevn.luv2code.ez_tro.dto.response.BillDetailResponse;
import carevn.luv2code.ez_tro.dto.response.BillResponse;
import carevn.luv2code.ez_tro.dto.response.PaymentResponse;
import carevn.luv2code.ez_tro.entity.Bill;
import carevn.luv2code.ez_tro.entity.Tenant;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.BillLifecycleStatus;
import carevn.luv2code.ez_tro.enums.BillStatus;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.BillMapper;
import carevn.luv2code.ez_tro.repository.BillRepository;
import carevn.luv2code.ez_tro.repository.TenantRepository;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.PaymentAllocationService;
import carevn.luv2code.ez_tro.service.admin.impl.BillServiceImpl;
import carevn.luv2code.ez_tro.service.admin.payment.InvoiceBalanceCalculator;
import carevn.luv2code.ez_tro.service.user.BillOwnerService;
import lombok.RequiredArgsConstructor;

/**
 * Service lấy hóa đơn (Bill) phía người thuê.
 *
 * <p>Service map từ {@code userId -> tenantId} rồi truy vấn hóa đơn theo tenant.
 */
@Service("ownerBillService")
@RequiredArgsConstructor
public class BillOwnerServiceImpl implements BillOwnerService {

    private static final long MAX_PAYMENT_PROOF_SIZE = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_PAYMENT_PROOF_CONTENT_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp", "application/pdf");

    //    private final BillRepository billRepository;
    //    private final BillMapper billMapper;
    //
    //    @Override
    //    public List<BillResponse> getBillsByUserId(Integer userId) {
    //        List<Bill> bills = billRepository.findByTenantId(userId);
    //        return bills.stream().map(billMapper::toResponse).collect(Collectors.toList());
    //    }

    private final BillRepository billRepository;
    private final BillMapper billMapper;
    private final TenantRepository tenantRepository;
    private final BillServiceImpl billService;
    private final PaymentAllocationService paymentAllocationService;
    private final InvoiceBalanceCalculator invoiceBalanceCalculator;
    private final MinioService minioService;

    /**
     * Lấy danh sách hóa đơn theo userId (thông qua tenant).
     *
     * @param userId id user
     * @return danh sách bill DTO
     */
    @Override
    public List<BillResponse> getBillsByUserId(Integer userId) {
        Tenant tenant = tenantRepository
                .findByUserId(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tenant cho user ID: " + userId));

        List<Bill> bills = billRepository.findVisibleToTenantByUserId(
                userId, BillLifecycleStatus.SENT, BillLifecycleStatus.CANCELLED);

        return bills.stream().map(billMapper::toResponse).collect(Collectors.toList());
    }

    /**
     * Lấy hóa đơn phân trang theo userId.
     *
     * @param userId id user
     * @param pageable phân trang
     * @return page bill DTO
     */
    @Override
    public Page<BillResponse> getBillsByCurrentUser(Integer userId, Pageable pageable) {
        Page<Bill> bills = billRepository.findVisibleToTenantByUserId(
                userId, BillLifecycleStatus.SENT, BillLifecycleStatus.CANCELLED, pageable);
        return bills.map(billMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public BillDetailResponse getBillDetailByCurrentUser(Integer userId, Integer billId) {
        Bill bill = resolveBillForCurrentTenant(userId, billId);
        return billService.toBillDetailResponse(bill, false, false);
    }

    @Override
    @Transactional
    public PaymentResponse submitPaymentByCurrentUser(
            Integer userId, Integer billId, BillPaymentSubmissionRequest request) {
        Bill bill = resolveBillForCurrentTenant(userId, billId);
        if (bill.getStatus() == BillStatus.CANCELLED || bill.getStatus() == BillStatus.PAID) {
            throw new AppException(ErrorCode.PAYMENT_SUBMISSION_NOT_ALLOWED);
        }
        validatePaymentProofRequirement(request);

        if (invoiceBalanceCalculator.calculate(bill).getOutstandingAmount().signum() <= 0) {
            throw new AppException(ErrorCode.PAYMENT_SUBMISSION_NOT_ALLOWED);
        }

        return paymentAllocationService.receiveTenantSubmittedPayment(bill, request);
    }

    @Override
    @Transactional
    public FileDTO uploadPaymentProofByCurrentUser(Integer userId, Integer billId, MultipartFile file) {
        Bill bill = resolveBillForCurrentTenant(userId, billId);
        validatePaymentProofFile(file);
        User currentUser = SecurityUtils.getCurrentUserOrThrow();
        return minioService.uploadPaymentProofForContract(
                file, currentUser, bill.getContract().getId());
    }

    private Bill resolveBillForCurrentTenant(Integer userId, Integer billId) {
        Tenant tenant = tenantRepository
                .findByUserId(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tenant cho user ID: " + userId));
        Bill bill = billRepository.findById(billId).orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));
        if (bill.getTenant() == null || !tenant.getId().equals(bill.getTenant().getId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
        if (!isVisibleToTenant(bill)) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
        return bill;
    }

    private void validatePaymentProofRequirement(BillPaymentSubmissionRequest request) {
        String paymentMethod = request != null && request.getPaymentMethod() != null
                ? request.getPaymentMethod().trim().toLowerCase()
                : null;
        if ("bank_transfer".equals(paymentMethod) && request.getProofFileId() == null) {
            throw new AppException(ErrorCode.PAYMENT_PROOF_FILE_REQUIRED);
        }
    }

    private void validatePaymentProofFile(MultipartFile file) {
        if (file == null
                || file.isEmpty()
                || file.getOriginalFilename() == null
                || file.getOriginalFilename().isBlank()) {
            throw new AppException(ErrorCode.PAYMENT_PROOF_FILE_INVALID);
        }
        if (file.getSize() > MAX_PAYMENT_PROOF_SIZE) {
            throw new AppException(ErrorCode.MAX_UPLOAD_SIZE_EXCEEDED);
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_PAYMENT_PROOF_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new AppException(ErrorCode.PAYMENT_PROOF_FILE_TYPE_INVALID);
        }
    }

    private boolean isVisibleToTenant(Bill bill) {
        if (bill == null) {
            return false;
        }
        if (bill.getLifecycleStatus() == null) {
            return false;
        }
        if (bill.getLifecycleStatus() == BillLifecycleStatus.SENT) {
            return true;
        }
        return bill.getLifecycleStatus() == BillLifecycleStatus.CANCELLED && bill.getSentAt() != null;
    }
}
