package carevn.luv2code.ez_tro.util;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

import carevn.luv2code.ez_tro.dto.requests.PaymentAllocateRequest;
import carevn.luv2code.ez_tro.dto.requests.PaymentAllocationItemRequest;
import carevn.luv2code.ez_tro.entity.BillLine;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;

public final class BillingIntegrityUtils {

    private BillingIntegrityUtils() {}

    public static void validateBillAmountMatchesLines(BigDecimal billAmount, List<BillLine> lines) {
        List<BillLine> safeLines = lines == null
                ? List.of()
                : lines.stream().filter(Objects::nonNull).toList();
        if (safeLines.isEmpty()) {
            if (billAmount != null && billAmount.signum() > 0) {
                throw new AppException(ErrorCode.BILL_AMOUNT_MISMATCH);
            }
            return;
        }

        if (billAmount == null) {
            throw new AppException(ErrorCode.BILL_AMOUNT_MISMATCH);
        }

        BigDecimal lineTotal = BigDecimal.ZERO;
        for (BillLine line : safeLines) {
            if (line.getAmount() == null) {
                throw new AppException(ErrorCode.BILL_AMOUNT_MISMATCH);
            }
            lineTotal = lineTotal.add(line.getAmount());
        }

        if (lineTotal.compareTo(billAmount) != 0) {
            throw new AppException(ErrorCode.BILL_AMOUNT_MISMATCH);
        }
    }

    public static void validateManualAllocationRequest(PaymentAllocateRequest request) {
        if (request == null
                || request.getAllocations() == null
                || request.getAllocations().isEmpty()) {
            return;
        }

        for (PaymentAllocationItemRequest item : request.getAllocations()) {
            if (item == null
                    || item.getBillId() == null
                    || item.getAmount() == null
                    || item.getAmount().signum() <= 0) {
                throw new AppException(ErrorCode.PAYMENT_ALLOCATION_AMOUNT_INVALID);
            }
        }
    }
}
