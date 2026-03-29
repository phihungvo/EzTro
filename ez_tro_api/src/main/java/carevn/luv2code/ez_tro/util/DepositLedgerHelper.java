package carevn.luv2code.ez_tro.util;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import carevn.luv2code.ez_tro.dto.response.DepositLedgerSummaryResponse;
import carevn.luv2code.ez_tro.dto.response.DepositTransactionSummaryResponse;
import carevn.luv2code.ez_tro.entity.DepositTransaction;
import carevn.luv2code.ez_tro.enums.DepositTransactionType;

/**
 * Tiện ích hỗ trợ tính toán tổng quan sổ cọc/deposit ledger.
 */
public final class DepositLedgerHelper {

    private DepositLedgerHelper() {}

    public static DepositLedgerSummaryResponse summarize(List<DepositTransaction> transactions) {
        if (transactions == null) {
            return DepositLedgerSummaryResponse.builder()
                    .totalCollected(BigDecimal.ZERO)
                    .totalDeducted(BigDecimal.ZERO)
                    .totalRefunded(BigDecimal.ZERO)
                    .currentBalance(BigDecimal.ZERO)
                    .build();
        }

        BigDecimal totalCollected = BigDecimal.ZERO;
        BigDecimal totalDeducted = BigDecimal.ZERO;
        BigDecimal totalRefunded = BigDecimal.ZERO;
        BigDecimal currentBalance = BigDecimal.ZERO;

        for (DepositTransaction transaction : transactions) {
            BigDecimal amount = transaction.getAmount() == null ? BigDecimal.ZERO : transaction.getAmount();
            DepositTransactionType type = transaction.getTransactionType();
            if (type == null) {
                continue;
            }
            switch (type) {
                case COLLECT, ADJUST_IN, TRANSFER_IN -> {
                    totalCollected = totalCollected.add(amount);
                    currentBalance = currentBalance.add(amount);
                }
                case REFUND -> {
                    totalRefunded = totalRefunded.add(amount);
                    currentBalance = currentBalance.subtract(amount);
                }
                case ADJUST_OUT, DEDUCT_FOR_DAMAGE, DEDUCT_FOR_UNPAID_INVOICE, TRANSFER_OUT -> {
                    totalDeducted = totalDeducted.add(amount);
                    currentBalance = currentBalance.subtract(amount);
                }
                default -> {
                    // other transaction types do not affect summary (or are neutral)
                }
            }
        }

        return DepositLedgerSummaryResponse.builder()
                .totalCollected(totalCollected)
                .totalDeducted(totalDeducted)
                .totalRefunded(totalRefunded)
                .currentBalance(currentBalance)
                .build();
    }

    public static DepositTransactionSummaryResponse toSummaryResponse(DepositTransaction transaction) {
        if (transaction == null) {
            return null;
        }
        return DepositTransactionSummaryResponse.builder()
                .id(transaction.getId())
                .transactionType(transaction.getTransactionType())
                .amount(transaction.getAmount())
                .currency(transaction.getCurrency())
                .referenceType(transaction.getReferenceType())
                .referenceId(transaction.getReferenceId())
                .note(transaction.getNote())
                .createdBy(
                        transaction.getCreatedBy() == null
                                ? null
                                : transaction.getCreatedBy().getId())
                .createdByName(
                        transaction.getCreatedBy() == null
                                ? null
                                : transaction.getCreatedBy().getFullName())
                .occurredAt(transaction.getOccurredAt())
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    public static List<DepositTransactionSummaryResponse> toSummaryResponses(List<DepositTransaction> transactions) {
        if (transactions == null) {
            return List.of();
        }
        return transactions.stream()
                .map(DepositLedgerHelper::toSummaryResponse)
                .filter(t -> t != null)
                .collect(Collectors.toList());
    }
}
