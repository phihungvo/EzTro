package carevn.luv2code.ez_tro.service.admin.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.response.ReconciliationReportResponse;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.service.admin.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class BillingDiscrepancyAlertService {

    @Value("${app.billing.discrepancy.threshold:0.01}")
    private BigDecimal threshold;

    private final NotificationService notificationService;

    /**
     * Kiểm tra tỷ lệ công nợ trên tổng hóa đơn và gửi cảnh báo nếu vượt ngưỡng.
     *
     * @param contract hợp đồng cần kiểm tra
     * @param report   báo cáo đối chiếu chứa thông tin công nợ và tổng hóa đơn
     */
    public void checkAndAlert(Contract contract, ReconciliationReportResponse report) {
        if (contract == null || report == null) {
            return;
        }
        BigDecimal invoiceTotal = report.getInvoiceTotal();
        BigDecimal outstanding = report.getOutstandingTotal();
        if (invoiceTotal == null || outstanding == null || invoiceTotal.signum() == 0) {
            return;
        }

        BigDecimal ratio =
                outstanding.divide(invoiceTotal, 4, RoundingMode.HALF_UP).max(BigDecimal.ZERO);

        if (threshold == null) {
            threshold = BigDecimal.ZERO;
        }

        if (ratio.compareTo(threshold) <= 0) {
            return;
        }

        Integer ownerId = resolveOwnerId(contract);
        if (ownerId == null) {
            return;
        }

        log.warn(
                "Billing discrepancy ratio {} for contract {} (threshold {})",
                ratio,
                contract.getContractCode(),
                threshold);

        String message = String.format(
                "Công nợ %.2f%% trong hợp đồng %s vượt ngưỡng %.2f%%",
                ratio.multiply(BigDecimal.valueOf(100)).doubleValue(),
                contract.getContractCode(),
                threshold.multiply(BigDecimal.valueOf(100)).doubleValue());

        notificationService.sendToUser(
                ownerId,
                "Công nợ/Hóa đơn chưa thanh toán",
                message,
                "BILL_DISCREPANCY",
                Map.of(
                        "contractId", contract.getId(),
                        "outstanding", outstanding,
                        "invoiceTotal", invoiceTotal,
                        "ratio", ratio));
    }

    public BigDecimal thresholdOrZero() {
        return threshold != null ? threshold : BigDecimal.ZERO;
    }

    private Integer resolveOwnerId(Contract contract) {
        if (contract == null || contract.getRoom() == null) {
            return null;
        }
        if (contract.getRoom().getBoardingHouse() == null) {
            return null;
        }
        if (contract.getRoom().getBoardingHouse().getOwner() == null) {
            return null;
        }
        return contract.getRoom().getBoardingHouse().getOwner().getId();
    }
}
