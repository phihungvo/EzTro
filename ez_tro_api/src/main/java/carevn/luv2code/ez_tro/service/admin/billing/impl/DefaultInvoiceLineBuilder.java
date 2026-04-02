package carevn.luv2code.ez_tro.service.admin.billing.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashMap;
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
import carevn.luv2code.ez_tro.entity.ContractVersion;
import carevn.luv2code.ez_tro.entity.MeterReading;
import carevn.luv2code.ez_tro.enums.BillLineType;
import carevn.luv2code.ez_tro.enums.BillingCycle;
import carevn.luv2code.ez_tro.enums.InvoiceType;
import carevn.luv2code.ez_tro.enums.ServiceType;
import carevn.luv2code.ez_tro.repository.ContractVersionRepository;
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
    private final ContractVersionRepository contractVersionRepository;
    private final Gson gson = new Gson();

    private record RentBuildResult(List<BillLine> lines, BigDecimal totalAmount) {}

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

        RentBuildResult rentBuildResult =
                buildRentLinesByVersion(contract, version, billingCycle, billingPeriodStart, billingPeriodEnd);
        if (rentBuildResult.lines() != null && !rentBuildResult.lines().isEmpty()) {
            lines.addAll(rentBuildResult.lines());
        }
        BigDecimal rentAmount = rentBuildResult.totalAmount();

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

            BillLine line = buildLineForRule(contract, billingPeriodStart, billingPeriodEnd, rule);
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

    private RentBuildResult buildRentLinesByVersion(
            Contract contract,
            ContractVersionSummaryResponse currentVersion,
            BillingCycle billingCycle,
            LocalDate billingPeriodStart,
            LocalDate billingPeriodEnd) {

        if (billingPeriodStart == null || billingPeriodEnd == null || billingPeriodEnd.isBefore(billingPeriodStart)) {
            return new RentBuildResult(List.of(), BigDecimal.ZERO);
        }

        LocalDate contractStart = contract.getStartDate() != null ? contract.getStartDate() : billingPeriodStart;
        LocalDate contractEnd = contract.getEndDate() != null ? contract.getEndDate() : billingPeriodEnd;

        LocalDate usageStart = contractStart.isAfter(billingPeriodStart) ? contractStart : billingPeriodStart;
        LocalDate usageEnd = contractEnd.isBefore(billingPeriodEnd) ? contractEnd : billingPeriodEnd;
        if (usageEnd.isBefore(usageStart)) {
            return new RentBuildResult(List.of(), BigDecimal.ZERO);
        }

        BigDecimal fallbackPrice = currentVersion != null && currentVersion.getPrice() != null
                ? currentVersion.getPrice()
                : contract.getRentPrice();

        List<ContractVersion> versions =
                contractVersionRepository.findOverlappingVersions(contract.getId(), usageStart, usageEnd);

        List<BillLine> rentLines = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        LocalDate cursor = usageStart;

        // Nếu không có version nào thì fallback toàn bộ kỳ theo giá hiện tại/legacy.
        if (versions.isEmpty()) {
            BigDecimal amount = calculateProratedRentForSegment(fallbackPrice, billingCycle, usageStart, usageEnd);
            if (amount.signum() > 0) {
                rentLines.add(buildRentLine(
                        "RENT",
                        buildRentDescription(usageStart, usageEnd),
                        fallbackPrice,
                        amount,
                        Map.of(
                                "segmentStart", Objects.toString(usageStart, ""),
                                "segmentEnd", Objects.toString(usageEnd, ""),
                                "pricingSource", "fallback")));
                total = total.add(amount);
            }
            return new RentBuildResult(rentLines, total);
        }

        for (ContractVersion version : versions) {
            if (version == null) {
                continue;
            }
            LocalDate versionStart = version.getEffectiveFrom() != null ? version.getEffectiveFrom() : usageStart;
            LocalDate versionEnd = version.getEffectiveTo() != null ? version.getEffectiveTo() : usageEnd;

            if (versionEnd.isBefore(usageStart) || versionStart.isAfter(usageEnd)) {
                continue;
            }

            LocalDate segmentStart = maxDate(cursor, versionStart, usageStart);
            LocalDate segmentEnd = minDate(usageEnd, versionEnd);

            // Nếu có khoảng trống giữa cursor và versionStart, dùng giá fallback để tránh bỏ sót doanh thu.
            if (cursor.isBefore(segmentStart)) {
                LocalDate gapEnd = segmentStart.minusDays(1);
                BigDecimal gapAmount = calculateProratedRentForSegment(fallbackPrice, billingCycle, cursor, gapEnd);
                if (gapAmount.signum() > 0) {
                    rentLines.add(buildRentLine(
                            "RENT_GAP_" + cursor + "_" + gapEnd,
                            buildRentDescription(cursor, gapEnd),
                            fallbackPrice,
                            gapAmount,
                            Map.of(
                                    "segmentStart",
                                    Objects.toString(cursor, ""),
                                    "segmentEnd",
                                    Objects.toString(gapEnd, ""),
                                    "pricingSource",
                                    "fallback")));
                    total = total.add(gapAmount);
                }
            }

            if (!segmentEnd.isBefore(segmentStart)) {
                BigDecimal price = version.getPrice() != null ? version.getPrice() : fallbackPrice;
                BigDecimal amount = calculateProratedRentForSegment(price, billingCycle, segmentStart, segmentEnd);
                if (amount.signum() > 0) {
                    rentLines.add(buildRentLine(
                            "RENT_V" + version.getId() + "_" + segmentStart + "_" + segmentEnd,
                            buildRentDescription(segmentStart, segmentEnd),
                            price,
                            amount,
                            Map.of(
                                    "versionId",
                                    Objects.toString(version.getId(), ""),
                                    "segmentStart",
                                    Objects.toString(segmentStart, ""),
                                    "segmentEnd",
                                    Objects.toString(segmentEnd, ""),
                                    "effectiveFrom",
                                    Objects.toString(version.getEffectiveFrom(), ""),
                                    "effectiveTo",
                                    Objects.toString(version.getEffectiveTo(), ""),
                                    "pricingSource",
                                    "version")));
                    total = total.add(amount);
                }
            }

            if (!segmentEnd.isBefore(cursor)) {
                cursor = segmentEnd.plusDays(1);
            }
            if (cursor.isAfter(usageEnd)) {
                break;
            }
        }

        // Nếu còn dư phần cuối kỳ chưa được cover bởi version nào thì fallback.
        if (!cursor.isAfter(usageEnd)) {
            BigDecimal tailAmount = calculateProratedRentForSegment(fallbackPrice, billingCycle, cursor, usageEnd);
            if (tailAmount.signum() > 0) {
                rentLines.add(buildRentLine(
                        "RENT_GAP_" + cursor + "_" + usageEnd,
                        buildRentDescription(cursor, usageEnd),
                        fallbackPrice,
                        tailAmount,
                        Map.of(
                                "segmentStart", Objects.toString(cursor, ""),
                                "segmentEnd", Objects.toString(usageEnd, ""),
                                "pricingSource", "fallback")));
                total = total.add(tailAmount);
            }
        }

        return new RentBuildResult(rentLines, total);
    }

    private BillLine buildLineForRule(
            Contract contract,
            LocalDate billingPeriodStart,
            LocalDate billingPeriodEnd,
            ContractBillingRuleSummaryResponse rule) {
        Integer ruleId = rule.getId();
        String key = ruleId == null ? "RULE" : "RULE_" + ruleId;
        String name = rule.getUtilityName() != null ? rule.getUtilityName() : "Dịch vụ";

        ServiceType calculationType = rule.getCalculationType() != null ? rule.getCalculationType() : ServiceType.FIXED;

        if (calculationType == ServiceType.USAGE_BASED && rule.getUtilityId() != null) {
            return buildMeteredUtilityLine(contract, rule, key, name, billingPeriodStart, billingPeriodEnd);
        }

        BigDecimal unitPrice = nullToZero(rule.getUnitPrice());
        if (unitPrice.signum() == 0) {
            return null;
        }

        BigDecimal quantity = resolveRuleQuantity(rule, calculationType);
        BigDecimal amount = unitPrice.multiply(quantity).setScale(2, RoundingMode.HALF_UP);

        return BillLine.builder()
                .lineType(BillLineType.SERVICE)
                .lineKey(key)
                .description(name)
                .quantity(quantity)
                .unitPrice(unitPrice)
                .amount(amount)
                .utilityId(rule.getUtilityId())
                .metadataJson(gson.toJson(Map.of(
                        "billingRuleId", Objects.toString(ruleId, ""),
                        "calculationType", Objects.toString(calculationType, ""),
                        "configuredQuantity", quantity)))
                .build();
    }

    private BillLine buildMeteredUtilityLine(
            Contract contract,
            ContractBillingRuleSummaryResponse rule,
            String key,
            String name,
            LocalDate periodStart,
            LocalDate periodEnd) {
        Integer roomId = contract.getRoom() != null ? contract.getRoom().getId() : null;
        Integer utilityId = rule.getUtilityId();

        if (roomId == null) {
            return null;
        }

        if (periodStart == null || periodEnd == null || periodEnd.isBefore(periodStart)) {
            return null;
        }

        Date periodStartDate = toDate(periodStart);
        Date periodEndDate = toDate(periodEnd);
        MeterReading openingReading = meterReadingRepository
                .findTopByRoomIdAndUtilityIdAndReadingDateBeforeOrderByReadingDateDescIdDesc(
                        roomId, utilityId, periodStartDate)
                .orElse(null);
        MeterReading closingReading = meterReadingRepository
                .findTopByRoomIdAndUtilityIdAndReadingDateLessThanEqualOrderByReadingDateDescIdDesc(
                        roomId, utilityId, periodEndDate)
                .orElse(null);

        if (closingReading == null
                || closingReading.getReadingDate() == null
                || toLocalDate(closingReading.getReadingDate()).isBefore(periodStart)) {
            return buildMissingMeterLine(
                    key, name, utilityId, periodStart, periodEnd, periodEnd.getMonthValue(), periodEnd.getYear());
        }

        BigDecimal openingIndex = openingReading != null ? nullToZero(openingReading.getCurrentIndex()) : null;
        if (openingIndex == null && closingReading.getPreviousIndex() != null) {
            openingIndex = closingReading.getPreviousIndex();
        }
        if (openingIndex == null) {
            return buildMissingMeterLine(
                    key, name, utilityId, periodStart, periodEnd, periodStart.getMonthValue(), periodStart.getYear());
        }

        BigDecimal closingIndex = nullToZero(closingReading.getCurrentIndex());
        BigDecimal totalConsumption = closingIndex.subtract(openingIndex);
        if (totalConsumption.signum() < 0) {
            return buildMissingMeterLine(
                    key, name, utilityId, periodStart, periodEnd, periodEnd.getMonthValue(), periodEnd.getYear());
        }

        BigDecimal unitPrice = rule.getUnitPrice() != null ? rule.getUnitPrice() : closingReading.getUnitPrice();
        if (unitPrice == null) {
            unitPrice = closingReading.getUnitPrice();
        }
        BigDecimal totalAmount =
                nullToZero(unitPrice).multiply(totalConsumption).setScale(2, RoundingMode.HALF_UP);
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("timelineMode", "reading_date_range");
        metadata.put("openingReadingId", openingReading != null ? openingReading.getId() : null);
        metadata.put("closingReadingId", closingReading.getId());
        metadata.put(
                "openingReadingDate",
                openingReading != null ? Objects.toString(toLocalDate(openingReading.getReadingDate()), "") : null);
        metadata.put("closingReadingDate", Objects.toString(toLocalDate(closingReading.getReadingDate()), ""));
        metadata.put("openingIndex", openingIndex);
        metadata.put("closingIndex", closingIndex);
        metadata.put("consumption", totalConsumption);
        metadata.put("unitPrice", unitPrice);
        metadata.put("utilityId", Objects.toString(utilityId, ""));
        metadata.put("periodStart", Objects.toString(periodStart, ""));
        metadata.put("periodEnd", Objects.toString(periodEnd, ""));
        return BillLine.builder()
                .lineType(BillLineType.UTILITY_METERED)
                .lineKey(key)
                .description(name)
                .quantity(totalConsumption.signum() == 0 ? null : totalConsumption)
                .unitPrice(unitPrice)
                .amount(totalAmount)
                .utilityId(utilityId)
                .metadataJson(gson.toJson(metadata))
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

    private BigDecimal calculateProratedRentForSegment(
            BigDecimal cyclePrice, BillingCycle billingCycle, LocalDate segmentStart, LocalDate segmentEnd) {
        if (cyclePrice == null || cyclePrice.signum() <= 0) {
            return BigDecimal.ZERO;
        }
        if (segmentStart == null || segmentEnd == null || segmentEnd.isBefore(segmentStart)) {
            return BigDecimal.ZERO;
        }

        long actualDays = ChronoUnit.DAYS.between(segmentStart, segmentEnd) + 1L;
        if (actualDays <= 0L) {
            return BigDecimal.ZERO;
        }

        int baseDays = resolveBaseDays(billingCycle, segmentStart);
        BigDecimal dailyRate = cyclePrice.divide(BigDecimal.valueOf(baseDays), 6, RoundingMode.HALF_UP);
        return dailyRate.multiply(BigDecimal.valueOf(actualDays)).setScale(2, RoundingMode.HALF_UP);
    }

    private BillLine buildRentLine(
            String lineKey, String description, BigDecimal unitPrice, BigDecimal amount, Map<String, Object> metadata) {
        return BillLine.builder()
                .lineType(BillLineType.RENT)
                .lineKey(lineKey)
                .description(description)
                .quantity(BigDecimal.ONE)
                .unitPrice(unitPrice)
                .amount(amount)
                .metadataJson(metadata != null ? gson.toJson(metadata) : null)
                .build();
    }

    private LocalDate maxDate(LocalDate a, LocalDate b, LocalDate c) {
        LocalDate max = a;
        if (b != null && (max == null || b.isAfter(max))) {
            max = b;
        }
        if (c != null && (max == null || c.isAfter(max))) {
            max = c;
        }
        return max;
    }

    private LocalDate minDate(LocalDate a, LocalDate b) {
        LocalDate min = a;
        if (b != null && (min == null || b.isBefore(min))) {
            min = b;
        }
        return min;
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

    private BigDecimal resolveRuleQuantity(ContractBillingRuleSummaryResponse rule, ServiceType calculationType) {
        Integer configuredQuantity = rule.getQuantity();
        if (configuredQuantity == null || configuredQuantity < 1) {
            configuredQuantity = 1;
        }

        return switch (calculationType) {
            case PER_PERSON, PER_VEHICLE -> BigDecimal.valueOf(configuredQuantity.longValue());
            default -> BigDecimal.ONE;
        };
    }

    private List<YearMonth> resolveMonthsInRange(LocalDate start, LocalDate end) {
        if (start == null || end == null || end.isBefore(start)) {
            return List.of();
        }
        YearMonth cursor = YearMonth.from(start);
        YearMonth last = YearMonth.from(end);
        List<YearMonth> months = new ArrayList<>();
        while (!cursor.isAfter(last)) {
            months.add(cursor);
            cursor = cursor.plusMonths(1);
        }
        return months;
    }

    private BillLine buildMissingMeterLine(
            String key,
            String name,
            Integer utilityId,
            LocalDate periodStart,
            LocalDate periodEnd,
            int missingMonth,
            int missingYear) {
        return BillLine.builder()
                .lineType(BillLineType.UTILITY_METERED)
                .lineKey(key)
                .description(name + " (chưa có chỉ số)")
                .quantity(null)
                .unitPrice(null)
                .amount(BigDecimal.ZERO)
                .utilityId(utilityId)
                .metadataJson(gson.toJson(Map.of(
                        "missing_meter_reading",
                        true,
                        "utilityId",
                        Objects.toString(utilityId, ""),
                        "periodStart",
                        Objects.toString(periodStart, ""),
                        "periodEnd",
                        Objects.toString(periodEnd, ""),
                        "missingMonth",
                        missingMonth,
                        "missingYear",
                        missingYear)))
                .build();
    }

    private Date toDate(LocalDate date) {
        return java.sql.Date.valueOf(date);
    }

    private LocalDate toLocalDate(Date date) {
        if (date == null) {
            return null;
        }
        return date.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
    }

    private String extractFlag(String metadataJson) {
        if (metadataJson == null || metadataJson.isBlank()) {
            return null;
        }
        return metadataJson.contains("\"missing_meter_reading\":true") ? "missing_meter_reading" : null;
    }
}
