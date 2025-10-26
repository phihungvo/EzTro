package carevn.luv2code.ez_tro.service.owner.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.response.DashboardSummaryResponse;
import carevn.luv2code.ez_tro.entity.*;
import carevn.luv2code.ez_tro.enums.BillStatus;
import carevn.luv2code.ez_tro.repository.*;
import carevn.luv2code.ez_tro.service.owner.UserDashboardService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserUserDashboardServiceImpl implements UserDashboardService {

    private final TenantRepository tenantRepository;
    private final ContractRepository contractRepository;
    private final BillRepository billRepository;

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

        // Lấy hóa đơn mới nhất của hợp đồng
        Bill bill =
                billRepository.findTopByContractOrderByCreatedAtDesc(contract).orElse(null);

        String paymentStatus = bill != null
                ? (bill.getStatus() == BillStatus.PAID ? "Đã Thanh Toán" : "Chưa Thanh Toán")
                : "Chưa Thanh Toán";

        return DashboardSummaryResponse.builder()
                .roomNumber(contract.getRoom().getRoomNumber())
                .monthlyRent(contract.getRentPrice())
                .paymentStatus(paymentStatus)
                .contractEndDate(contract.getEndDate())
                .build();
    }
}
