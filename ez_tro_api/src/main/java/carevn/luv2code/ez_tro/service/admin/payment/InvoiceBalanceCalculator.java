package carevn.luv2code.ez_tro.service.admin.payment;

import java.math.BigDecimal;

import org.springframework.stereotype.Component;

import carevn.luv2code.ez_tro.dto.response.InvoiceBalanceResponse;
import carevn.luv2code.ez_tro.entity.Bill;
import carevn.luv2code.ez_tro.enums.InvoicePaymentStatus;
import carevn.luv2code.ez_tro.repository.PaymentAllocationRepository;
import lombok.RequiredArgsConstructor;

/**
 * Calculator tính balance của một hóa đơn dựa trên các allocations đã ghi nhận.
 *
 * <p>Kết quả trả về gồm: tổng hóa đơn, tổng đã phân bổ, công nợ (outstanding), overpaid và trạng thái thanh toán.
 */
@Component
@RequiredArgsConstructor
public class InvoiceBalanceCalculator {

    private final PaymentAllocationRepository paymentAllocationRepository;

    /**
     * Tính balance cho một bill.
     *
     * @param bill hóa đơn
     * @return DTO balance
     */
    public InvoiceBalanceResponse calculate(Bill bill) {
        BigDecimal invoiceTotal = bill.getAmount() != null ? bill.getAmount() : BigDecimal.ZERO;
        BigDecimal allocatedAmount = paymentAllocationRepository.sumAllocatedByBillId(bill.getId());
        if (allocatedAmount == null) {
            allocatedAmount = BigDecimal.ZERO;
        }

        BigDecimal outstanding = invoiceTotal.subtract(allocatedAmount);
        BigDecimal overpaid = BigDecimal.ZERO;
        BigDecimal outstandingNormalized = outstanding;
        InvoicePaymentStatus status;

        if (outstanding.signum() > 0) {
            status = allocatedAmount.signum() > 0 ? InvoicePaymentStatus.PARTIALLY_PAID : InvoicePaymentStatus.UNPAID;
        } else if (outstanding.signum() == 0) {
            status = InvoicePaymentStatus.PAID;
        } else {
            status = InvoicePaymentStatus.OVERPAID;
            overpaid = outstanding.abs();
            outstandingNormalized = BigDecimal.ZERO;
        }

        return InvoiceBalanceResponse.builder()
                .billId(bill.getId())
                .contractId(bill.getContract() != null ? bill.getContract().getId() : null)
                .generationKey(bill.getGenerationKey())
                .billingPeriodStart(bill.getBillingPeriodStart())
                .billingPeriodEnd(bill.getBillingPeriodEnd())
                .dueDate(bill.getDueDate())
                .invoiceTotal(invoiceTotal)
                .allocatedAmount(allocatedAmount)
                .outstandingAmount(outstandingNormalized)
                .overpaidAmount(overpaid)
                .paymentStatus(status)
                .billStatus(bill.getStatus())
                .build();
    }
}
