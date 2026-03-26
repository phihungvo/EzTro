package carevn.luv2code.ez_tro.service.admin.billing.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.stereotype.Component;

import com.google.gson.Gson;

import carevn.luv2code.ez_tro.dto.requests.InvoicePreviewRequest;
import carevn.luv2code.ez_tro.dto.response.ContractBillingRuleSummaryResponse;
import carevn.luv2code.ez_tro.dto.response.ContractSnapshotResponse;
import carevn.luv2code.ez_tro.dto.response.ContractVersionSummaryResponse;
import carevn.luv2code.ez_tro.entity.BillLine;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.MeterReading;
import carevn.luv2code.ez_tro.enums.BillLineType;
import carevn.luv2code.ez_tro.enums.BillingCycle;
import carevn.luv2code.ez_tro.enums.InvoiceType;
import carevn.luv2code.ez_tro.enums.ServiceType;
import carevn.luv2code.ez_tro.repository.MeterReadingRepository;
import carevn.luv2code.ez_tro.service.admin.billing.InvoiceLineBuildResult;
import carevn.luv2code.ez_tro.service.admin.billing.InvoiceLineBuilder;
import lombok.RequiredArgsConstructor;

/**
 * Default implementation của {@link InvoiceLineBuilder}.
 *
 * <p>Luồng dựng line items:
 * <ul>
 *   <li>Tính tiền thuê (có thể proration theo kỳ).</li>
 *   <li>Dựng line dịch vụ theo billing rules; với USAGE_BASED thì đọc meter reading theo tháng/năm.</li>
 *   <li>Thêm manual adjustment và discount (nếu có).</li>
 * </ul>
 */
@Component
@RequiredArgsConstructor
public class DefaultInvoiceLineBuilder implements InvoiceLineBuilder {

    private final MeterReadingRepository meterReadingRepository;
    private final Gson gson = new Gson();

    /**
     * Dựng danh sách bill lines cho một kỳ billing.
     *
     * @param contract hợp đồng
     * @param snapshot snapshot hợp đồng tại thời điểm tính
     * @param billingPeriodStart ngày bắt đầu kỳ tính
     * @param billingPeriodEnd ngày kết thúc kỳ tính
     * @param invoiceType loại invoice (rent/...)
     * @param request request preview/finalize (extra/discount/notes...)
     * @return kết quả build line items
     */
    @Override
    public InvoiceLineBuildResult buildLines(
            Contract contract,
            ContractSnapshotResponse snapshot,
            LocalDate billingPeriodStart,
            LocalDate billingPeriodEnd,
            InvoiceType invoiceType,
            InvoicePreviewRequest request) {

        List<BillLine> lines = new ArrayList<>();
        ContractVersionSummaryResponse version = snapshot != null ? snapshot.getCurrentVersion() : null;

        BillingCycle billingCycle =
                version != null && version.getBillingCycle() != null ? version.getBillingCycle() : BillingCycle.MONTHLY;

        BigDecimal cyclePrice =
                version != null && version.getPrice() != null ? version.getPrice() : contract.getRentPrice();
        BigDecimal rentAmount = calculateProratedRentForPeriod(
                contract, cyclePrice, billingCycle, billingPeriodStart, billingPeriodEnd);
        if (rentAmount.signum() > 0) {
            lines.add(BillLine.builder()
                    .lineType(BillLineType.RENT)
                    .lineKey("RENT")
                    .description(buildRentDescription(billingPeriodStart, billingPeriodEnd))
                    .quantity(BigDecimal.ONE)
                    .unitPrice(cyclePrice)
                    .amount(rentAmount)
                    .metadataJson(gson.toJson(Map.of(
                            "billingCycle", Objects.toString(billingCycle, ""),
                            "periodStart", Objects.toString(billingPeriodStart, ""),
                            "periodEnd", Objects.toString(billingPeriodEnd, ""))))
                    .build());
        }

        boolean hasMissingMeterReadings = false;
        BigDecimal serviceAmount = BigDecimal.ZERO;

        List<ContractBillingRuleSummaryResponse> rules = snapshot != null && snapshot.getActiveBillingRules() != null
                ? snapshot.getActiveBillingRules()
                : List.of();

        for (ContractBillingRuleSummaryResponse rule : rules) {
            if (rule == null) {
                continue;
            }
            if (rule.getCycle() != null && rule.getCycle() != billingCycle) {
                continue;
            }

            BillLine line = buildLineForRule(contract, billingPeriodStart, rule);
            if (line == null) {
                continue;
            }

            if (Boolean.TRUE.equals(Objects.equals("missing_meter_reading", extractFlag(line.getMetadataJson())))) {
                hasMissingMeterReadings = true;
            }

            serviceAmount = serviceAmount.add(nullToZero(line.getAmount()));
            lines.add(line);
        }

        BigDecimal extraAmount = request != null ? nullToZero(request.getExtraAmount()) : BigDecimal.ZERO;
        if (extraAmount.signum() > 0) {
            BillLine adjustment = BillLine.builder()
                    .lineType(BillLineType.MANUAL_ADJUSTMENT)
                    .lineKey("MANUAL_ADJUSTMENT")
                    .description("Phí phát sinh / bổ sung")
                    .quantity(BigDecimal.ONE)
                    .unitPrice(extraAmount)
                    .amount(extraAmount)
                    .build();
            serviceAmount = serviceAmount.add(extraAmount);
            lines.add(adjustment);
        }

        BigDecimal discountAmount = request != null ? nullToZero(request.getDiscountAmount()) : BigDecimal.ZERO;
        if (discountAmount.signum() > 0) {
            BillLine discount = BillLine.builder()
                    .lineType(BillLineType.DISCOUNT)
                    .lineKey("DISCOUNT")
                    .description(
                            request != null
                                            && request.getDiscountReason() != null
                                            && !request.getDiscountReason().isBlank()
                                    ? "Giảm giá: " + request.getDiscountReason().trim()
                                    : "Giảm giá / ưu đãi")
                    .quantity(BigDecimal.ONE)
                    .unitPrice(discountAmount)
                    .amount(discountAmount.negate())
                    .build();
            lines.add(discount);
        }

        BigDecimal totalAmount = lines.stream()
                .map(BillLine::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return InvoiceLineBuildResult.builder()
                .lines(lines)
                .totalAmount(totalAmount)
                .rentAmount(rentAmount)
                .serviceAmount(serviceAmount)
                .discountAmount(discountAmount)
                .penaltyAmount(BigDecimal.ZERO)
                .hasMissingMeterReadings(hasMissingMeterReadings)
                .build();
    }

    private BillLine buildLineForRule(
            Contract contract, LocalDate billingPeriodStart, ContractBillingRuleSummaryResponse rule) {
        Integer ruleId = rule.getId();
        String key = ruleId == null ? "RULE" : "RULE_" + ruleId;
        String name = rule.getUtilityName() != null ? rule.getUtilityName() : "Dịch vụ";

        ServiceType calculationType = rule.getCalculationType() != null ? rule.getCalculationType() : ServiceType.FIXED;

        if (calculationType == ServiceType.USAGE_BASED && rule.getUtilityId() != null) {
            int month = billingPeriodStart.getMonthValue();
            int year = billingPeriodStart.getYear();

            return buildMeteredUtilityLine(contract, rule, key, name, month, year);
        }

        BigDecimal unitPrice = nullToZero(rule.getUnitPrice());
        if (unitPrice.signum() == 0) {
            return null;
        }

        return BillLine.builder()
                .lineType(BillLineType.SERVICE)
                .lineKey(key)
                .description(name)
                .quantity(BigDecimal.ONE)
                .unitPrice(unitPrice)
                .amount(unitPrice)
                .utilityId(rule.getUtilityId())
                .metadataJson(gson.toJson(Map.of(
                        "billingRuleId", Objects.toString(ruleId, ""),
                        "calculationType", Objects.toString(calculationType, ""))))
                .build();
    }

    private BillLine buildMeteredUtilityLine(
            Contract contract, ContractBillingRuleSummaryResponse rule, String key, String name, int month, int year) {
        Integer roomId = contract.getRoom() != null ? contract.getRoom().getId() : null;
        Integer utilityId = rule.getUtilityId();

        if (roomId == null) {
            return null;
        }

        MeterReading reading = meterReadingRepository
                .findByRoomIdAndUtilityIdAndPeriodMonthAndPeriodYear(roomId, utilityId, month, year)
                .orElse(null);

        if (reading == null) {
            return BillLine.builder()
                    .lineType(BillLineType.UTILITY_METERED)
                    .lineKey(key)
                    .description(name + " (chưa có chỉ số)")
                    .quantity(null)
                    .unitPrice(rule.getUnitPrice())
                    .amount(BigDecimal.ZERO)
                    .utilityId(utilityId)
                    .metadataJson(gson.toJson(Map.of(
                            "missing_meter_reading",
                            true,
                            "utilityId",
                            Objects.toString(utilityId, ""),
                            "periodMonth",
                            month,
                            "periodYear",
                            year)))
                    .build();
        }

        BigDecimal amount = nullToZero(reading.getAmount());
        return BillLine.builder()
                .lineType(BillLineType.UTILITY_METERED)
                .lineKey(key)
                .description(name)
                .quantity(reading.getConsumption())
                .unitPrice(reading.getUnitPrice())
                .amount(amount)
                .utilityId(utilityId)
                .metadataJson(gson.toJson(Map.of(
                        "meterReadingId",
                        Objects.toString(reading.getId(), ""),
                        "utilityId",
                        Objects.toString(utilityId, ""),
                        "periodMonth",
                        month,
                        "periodYear",
                        year)))
                .build();
    }

    private BigDecimal calculateProratedRentForPeriod(
            Contract contract,
            BigDecimal cyclePrice,
            BillingCycle billingCycle,
            LocalDate billingPeriodStart,
            LocalDate billingPeriodEnd) {

        if (cyclePrice == null || cyclePrice.signum() <= 0) {
            return BigDecimal.ZERO;
        }
        if (billingPeriodStart == null || billingPeriodEnd == null || billingPeriodEnd.isBefore(billingPeriodStart)) {
            return BigDecimal.ZERO;
        }

        LocalDate contractStart = contract.getStartDate();
        LocalDate contractEnd = contract.getEndDate() != null ? contract.getEndDate() : LocalDate.MAX;

        LocalDate usageStart =
                contractStart != null && contractStart.isAfter(billingPeriodStart) ? contractStart : billingPeriodStart;
        LocalDate usageEnd = contractEnd.isBefore(billingPeriodEnd) ? contractEnd : billingPeriodEnd;
        if (usageEnd.isBefore(usageStart)) {
            return BigDecimal.ZERO;
        }

        long actualDays = ChronoUnit.DAYS.between(usageStart, usageEnd) + 1L;
        if (actualDays <= 0L) {
            return BigDecimal.ZERO;
        }

        int baseDays = resolveBaseDays(billingCycle, billingPeriodStart);
        BigDecimal dailyRate = cyclePrice.divide(BigDecimal.valueOf(baseDays), 6, RoundingMode.HALF_UP);

        return dailyRate.multiply(BigDecimal.valueOf(actualDays)).setScale(2, RoundingMode.HALF_UP);
    }

    private int resolveBaseDays(BillingCycle billingCycle, LocalDate billingPeriodStart) {
        if (billingCycle == BillingCycle.DAILY) {
            return 1;
        }
        if (billingCycle == BillingCycle.WEEKLY) {
            return 7;
        }
        YearMonth ym = YearMonth.from(billingPeriodStart);
        return ym.lengthOfMonth();
    }

    private String buildRentDescription(LocalDate billingPeriodStart, LocalDate billingPeriodEnd) {
        if (billingPeriodStart == null || billingPeriodEnd == null) {
            return "Tiền phòng";
        }
        return "Tiền phòng (" + billingPeriodStart + " → " + billingPeriodEnd + ")";
    }

    private BigDecimal nullToZero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private String extractFlag(String metadataJson) {
        if (metadataJson == null || metadataJson.isBlank()) {
            return null;
        }
        return metadataJson.contains("\"missing_meter_reading\":true") ? "missing_meter_reading" : null;
    }
}
