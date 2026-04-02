package carevn.luv2code.ez_tro.service.user.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.response.DashboardSummaryResponse;
import carevn.luv2code.ez_tro.dto.response.InvoiceBalanceResponse;
import carevn.luv2code.ez_tro.entity.*;
import carevn.luv2code.ez_tro.enums.BillLifecycleStatus;
import carevn.luv2code.ez_tro.enums.BillStatus;
import carevn.luv2code.ez_tro.repository.*;
import carevn.luv2code.ez_tro.service.admin.payment.InvoiceBalanceCalculator;
import carevn.luv2code.ez_tro.service.user.UserDashboardService;
import lombok.RequiredArgsConstructor;

/**
 * Service tổng hợp dữ liệu dashboard phía người thuê.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserUserDashboardServiceImpl implements UserDashboardService {

    private final TenantRepository tenantRepository;
    private final ContractRepository contractRepository;
    private final BillRepository billRepository;
    private final InvoiceBalanceCalculator invoiceBalanceCalculator;

    /**
     * Lấy thông tin hóa đơn tổng hợp cho dashboard của người thuê.
     *
     * @param userId ID của người thuê
     * @return Thông tin tổng hợp hiển thị trên dashboard
     */
    @Override
    public DashboardSummaryResponse getTenantSummaryInfoByUserId(Integer userId) {
        Tenant tenant = tenantRepository
                .findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tenant cho user ID: " + userId));

        // Tìm hợp đồng đang hoạt động của tenant
        Contract contract = contractRepository
                .findActiveContractByTenantId(tenant.getId())
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy hợp đồng đang hoạt động cho tenant ID: " + tenant.getId()));

        List<Bill> visibleBills =
                billRepository
                        .findVisibleToTenantByUserId(userId, BillLifecycleStatus.SENT, BillLifecycleStatus.CANCELLED)
                        .stream()
                        .filter(bill -> bill != null
                                && bill.getContract() != null
                                && Objects.equals(bill.getContract().getId(), contract.getId()))
                        .toList();
        Bill latestBill = visibleBills.isEmpty() ? null : visibleBills.getFirst();

        int unpaidBillCount = 0;
        BigDecimal totalOutstanding = BigDecimal.ZERO;
        for (Bill bill : visibleBills) {
            if (bill == null || bill.getStatus() == BillStatus.CANCELLED) {
                continue;
            }
            InvoiceBalanceResponse balance = invoiceBalanceCalculator.calculate(bill);
            BigDecimal outstanding = balance != null && balance.getOutstandingAmount() != null
                    ? balance.getOutstandingAmount()
                    : BigDecimal.ZERO;
            if (outstanding.signum() > 0) {
                unpaidBillCount++;
                totalOutstanding = totalOutstanding.add(outstanding);
            }
        }

        String paymentStatus = resolveDashboardPaymentStatus(latestBill);

        return DashboardSummaryResponse.builder()
                .roomNumber(contract.getRoom().getRoomNumber())
                .monthlyRent(contract.getRentPrice())
                .paymentStatus(paymentStatus)
                .unpaidBillCount(unpaidBillCount)
                .outstandingAmount(totalOutstanding)
                .latestBillDueDate(latestBill != null ? latestBill.getDueDate() : null)
                .contractStartDate(contract.getStartDate())
                .contractEndDate(contract.getEndDate())
                .build();
    }

    private String resolveDashboardPaymentStatus(Bill latestBill) {
        if (latestBill == null || latestBill.getStatus() == null) {
            return "Chưa có hóa đơn";
        }
        return switch (latestBill.getStatus()) {
            case PAID -> "Đã thanh toán";
            case PARTIALLY_PAID -> "Thanh toán một phần";
            case OVERDUE -> "Quá hạn thanh toán";
            case CANCELLED -> "Hóa đơn đã hủy";
            default -> "Chưa thanh toán";
        };
    }
}
