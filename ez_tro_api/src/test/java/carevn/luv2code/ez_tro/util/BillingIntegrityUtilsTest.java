package carevn.luv2code.ez_tro.util;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;

import carevn.luv2code.ez_tro.dto.requests.PaymentAllocateRequest;
import carevn.luv2code.ez_tro.dto.requests.PaymentAllocationItemRequest;
import carevn.luv2code.ez_tro.entity.BillLine;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;

class BillingIntegrityUtilsTest {

    @Test
    void validateBillAmountMatchesLines_shouldPassWhenTotalsMatch() {
        List<BillLine> lines = List.of(
                BillLine.builder().amount(new BigDecimal("700000")).build(),
                BillLine.builder().amount(new BigDecimal("300000")).build());

        assertDoesNotThrow(
                () -> BillingIntegrityUtils.validateBillAmountMatchesLines(new BigDecimal("1000000"), lines));
    }

    @Test
    void validateBillAmountMatchesLines_shouldRejectWhenTotalsMismatch() {
        List<BillLine> lines = List.of(
                BillLine.builder().amount(new BigDecimal("700000")).build(),
                BillLine.builder().amount(new BigDecimal("200000")).build());

        AppException exception = assertThrows(
                AppException.class,
                () -> BillingIntegrityUtils.validateBillAmountMatchesLines(new BigDecimal("1000000"), lines));

        assertEquals(ErrorCode.BILL_AMOUNT_MISMATCH, exception.getErrorCode());
    }

    @Test
    void validateManualAllocationRequest_shouldRejectNonPositiveAmount() {
        PaymentAllocateRequest request = PaymentAllocateRequest.builder()
                .allocations(List.of(PaymentAllocationItemRequest.builder()
                        .billId(10)
                        .amount(BigDecimal.ZERO)
                        .build()))
                .build();

        AppException exception =
                assertThrows(AppException.class, () -> BillingIntegrityUtils.validateManualAllocationRequest(request));

        assertEquals(ErrorCode.PAYMENT_ALLOCATION_AMOUNT_INVALID, exception.getErrorCode());
    }
}
