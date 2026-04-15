package carevn.luv2code.ez_tro.service.admin.document.impl;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.google.gson.Gson;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;

import carevn.luv2code.ez_tro.dto.response.BillAllocationDetailResponse;
import carevn.luv2code.ez_tro.dto.response.BillDetailResponse;
import carevn.luv2code.ez_tro.dto.response.BillLineDetailResponse;
import carevn.luv2code.ez_tro.enums.BillLifecycleStatus;
import carevn.luv2code.ez_tro.enums.BillLineType;
import carevn.luv2code.ez_tro.enums.BillStatus;
import carevn.luv2code.ez_tro.enums.InvoiceType;
import carevn.luv2code.ez_tro.enums.PaymentAllocationType;
import carevn.luv2code.ez_tro.enums.PaymentSource;
import carevn.luv2code.ez_tro.enums.PaymentStatus;
import carevn.luv2code.ez_tro.service.admin.document.BillDocumentExportService;
import carevn.luv2code.ez_tro.service.admin.document.BillDocumentFile;

@Service
public class BillDocumentExportServiceImpl implements BillDocumentExportService {

    private static final String PDF_CONTENT_TYPE = "application/pdf";
    private static final Locale VIETNAMESE = Locale.forLanguageTag("vi-VN");
    private static final ZoneId DOCUMENT_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
    private static final String FONT_FAMILY = "EZTro Sans";
    private static final List<Path> FONT_CANDIDATES = List.of(
            Path.of("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
            Path.of("/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf"),
            Path.of("/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf"),
            Path.of("/System/Library/Fonts/Supplemental/Arial Unicode.ttf"),
            Path.of("/Library/Fonts/Arial Unicode.ttf"));

    private final TemplateEngine templateEngine;
    private final Gson gson = new Gson();

    public BillDocumentExportServiceImpl(@Qualifier("templateEngine") TemplateEngine templateEngine) {
        this.templateEngine = templateEngine;
    }

    @Override
    public BillDocumentFile exportInvoiceDocument(BillDetailResponse detail) {
        String safeBillCode = sanitizeFileName(detail.getBillCode() != null ? detail.getBillCode() : "hoa-don");
        byte[] pdfContent = renderPdf("invoice", buildInvoiceContext(detail));
        return new BillDocumentFile("hoa-don-" + safeBillCode + ".pdf", PDF_CONTENT_TYPE, pdfContent);
    }

    @Override
    public BillDocumentFile exportReceiptDocument(BillDetailResponse detail) {
        String safeBillCode = sanitizeFileName(detail.getBillCode() != null ? detail.getBillCode() : "bien-nhan");
        byte[] pdfContent = renderPdf("receipt", buildReceiptContext(detail));
        return new BillDocumentFile("bien-nhan-" + safeBillCode + ".pdf", PDF_CONTENT_TYPE, pdfContent);
    }

    private byte[] renderPdf(String templateName, Map<String, Object> variables) {
        Context context = new Context(VIETNAMESE);
        context.setVariables(variables);
        String html = templateEngine.process(templateName, context);

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.useDefaultPageSize(210, 297, PdfRendererBuilder.PageSizeUnits.MM);
            builder.withHtmlContent(html, null);
            resolveFontPath().ifPresent(fontPath -> builder.useFont(fontPath.toFile(), FONT_FAMILY));
            builder.toStream(outputStream);
            builder.run();
            return outputStream.toByteArray();
        } catch (Exception exception) {
            throw new IllegalStateException("Không thể xuất PDF hóa đơn", exception);
        }
    }

    private Map<String, Object> buildInvoiceContext(BillDetailResponse detail) {
        List<LineItemRow> lineRows = buildLineRows(detail.getLines());
        AmountSummary amountSummary = calculateAmountSummary(detail.getLines());
        List<PaymentHistoryRow> paymentHistory = buildPaymentHistory(detail.getAllocations());
        PaymentInstructionInfo paymentInfo = parsePaymentInstructionInfo(detail);

        Map<String, Object> context = buildBaseContext(detail);
        context.put("documentLabel", "HÓA ĐƠN");
        context.put("documentTitle", "Hóa đơn thanh toán");
        context.put("documentSubtitle", "Chứng từ thanh toán tiền phòng và dịch vụ theo kỳ.");
        context.put("lineItems", lineRows);
        context.put("lineItemsPresent", !lineRows.isEmpty());
        context.put("bankName", displayText(paymentInfo.bankName()));
        context.put("bankBranch", displayText(paymentInfo.bankBranch()));
        context.put("bankAccountNumber", displayText(paymentInfo.bankAccountNumber()));
        context.put("bankAccountName", displayText(paymentInfo.bankAccountName()));
        context.put("transferContent", displayText(resolveTransferContent(detail, paymentInfo.transferContent())));
        context.put("qrCodePresent", false);
        context.put("cashPaymentNote", buildCashPaymentNote(detail));
        context.put("amountRent", formatCurrency(amountSummary.rentAmount()));
        context.put("amountServices", formatCurrency(amountSummary.serviceAmount()));
        context.put("amountOther", formatCurrency(amountSummary.otherAmount()));
        context.put("hasDiscount", amountSummary.discountAmount().signum() > 0);
        context.put(
                "amountDiscount",
                formatSignedCurrency(amountSummary.discountAmount().negate()));
        context.put("hasPenalty", amountSummary.penaltyAmount().signum() > 0);
        context.put("amountPenalty", formatCurrency(amountSummary.penaltyAmount()));
        context.put("amountPreviousBalance", formatCurrency(BigDecimal.ZERO));
        context.put("paymentHistoryPresent", !paymentHistory.isEmpty());
        context.put("paymentHistory", paymentHistory);
        return context;
    }

    private Map<String, Object> buildReceiptContext(BillDetailResponse detail) {
        List<AllocationRow> allocationRows = buildAllocationRows(detail.getAllocations());
        BigDecimal receiptTotal =
                allocationRows.stream().map(AllocationRow::rawAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> context = buildBaseContext(detail);
        context.put("documentLabel", "BIÊN NHẬN");
        context.put("documentTitle", "Biên nhận thanh toán");
        context.put("documentCodeLabel", "Số biên nhận");
        context.put("documentSubtitle", "Xác nhận các khoản thanh toán đã được ghi nhận cho hóa đơn.");
        context.put("allocations", allocationRows);
        context.put("allocationsPresent", !allocationRows.isEmpty());
        context.put("receiptTotal", formatCurrency(receiptTotal));
        context.put("paymentStatusLabel", translateInvoicePaymentStatus(detail.getPaymentStatus()));
        context.put("paymentStatusClass", resolvePaymentStatusClass(detail.getPaymentStatus()));
        return context;
    }

    private Map<String, Object> buildBaseContext(BillDetailResponse detail) {
        Map<String, Object> context = new HashMap<>();
        context.put("systemName", "EZ Trọ – Phần mềm quản lý nhà trọ");
        context.put("documentCodeLabel", "Số hóa đơn");
        context.put("generatedAt", formatDateTime(new Date()));
        context.put("documentNumber", displayText(detail.getBillCode()));
        context.put("billTitle", displayText(detail.getBillTitle()));
        context.put("contractCode", displayText(detail.getContractCode()));
        context.put("roomNumber", displayText(detail.getRoomNumber()));
        context.put("tenantName", displayText(detail.getTenantName()));
        context.put("tenantPhone", displayText(detail.getTenantPhone()));
        context.put("tenantIdNumber", displayText(detail.getTenantIdentityNumber()));
        context.put("occupantsCount", resolveOccupantsText(detail));
        context.put("invoiceTypeLabel", translateInvoiceType(detail.getInvoiceType()));
        context.put("billingPeriodLabel", formatPeriod(detail.getBillingPeriodStart(), detail.getBillingPeriodEnd()));
        context.put("dueDateLabel", formatDate(detail.getDueDate()));
        context.put(
                "issuedAtLabel",
                formatDateTime(detail.getIssuedAt() != null ? detail.getIssuedAt() : detail.getCreatedAt()));
        context.put("paymentDateLabel", formatDateTime(detail.getPaymentDate()));
        context.put("billStatusLabel", translateBillStatus(detail.getStatus()));
        context.put("billStatusClass", resolveBillStatusClass(detail.getStatus()));
        context.put("lifecycleStatusLabel", translateLifecycleStatus(detail.getLifecycleStatus()));
        context.put("lifecycleStatusClass", resolveLifecycleClass(detail.getLifecycleStatus()));
        context.put("paymentInstructions", normalizeOptionalText(detail.getPaymentInstructions()));
        context.put("paymentInstructionsPresent", hasText(detail.getPaymentInstructions()));
        context.put("publicNote", normalizeOptionalText(detail.getPublicNote()));
        context.put("publicNotePresent", hasText(detail.getPublicNote()));
        context.put("amountTotal", formatCurrency(detail.getAmount()));
        context.put(
                "amountAllocated",
                formatSignedCurrency(
                        normalizeAmount(detail.getAllocatedAmount()).negate()));
        context.put("amountOutstanding", formatCurrency(detail.getOutstandingAmount()));
        context.put("isSettled", normalizeAmount(detail.getOutstandingAmount()).signum() <= 0);
        context.put("companyName", resolveCompanyName(detail));
        context.put("companyAddress", displayText(resolveCompanyAddress(detail)));
        context.put("companyPhone", displayText(resolveCompanyPhone(detail)));
        context.put("companyEmail", displayText(resolveCompanyEmail(detail)));
        context.put("companyTaxId", "Chưa cấu hình");
        context.put("managerName", displayText(detail.getOwnerName()));
        return context;
    }

    private List<LineItemRow> buildLineRows(List<BillLineDetailResponse> lines) {
        if (lines == null || lines.isEmpty()) {
            return List.of();
        }
        List<LineItemRow> rows = new ArrayList<>();
        int index = 1;
        for (BillLineDetailResponse line : lines) {
            if (line == null) {
                continue;
            }
            Map<String, Object> metadata = parseMetadata(line.getMetadataJson());
            rows.add(new LineItemRow(
                    index++,
                    displayText(line.getDescription()),
                    buildLineNote(line, metadata),
                    translateLineType(line.getLineType()),
                    buildMeterInfo(line, metadata),
                    formatDecimal(line.getQuantity()),
                    formatCurrency(line.getUnitPrice()),
                    formatCurrency(line.getAmount())));
        }
        return rows;
    }

    private List<AllocationRow> buildAllocationRows(List<BillAllocationDetailResponse> allocations) {
        if (allocations == null || allocations.isEmpty()) {
            return List.of();
        }
        return allocations.stream()
                .filter(Objects::nonNull)
                .filter(allocation -> normalizeAmount(allocation.getAmount()).signum() > 0)
                .filter(allocation -> allocation.getAllocationType() != PaymentAllocationType.REVERSAL)
                .sorted(Comparator.comparing(
                        BillAllocationDetailResponse::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(allocation -> new AllocationRow(
                        displayText(allocation.getExternalReference()),
                        translatePaymentSource(allocation.getPaymentSource()),
                        translatePaymentStatus(allocation.getPaymentStatus()),
                        translateAllocationType(allocation.getAllocationType()),
                        formatDateTime(
                                allocation.getConfirmedAt() != null
                                        ? allocation.getConfirmedAt()
                                        : allocation.getReceivedAt()),
                        formatCurrency(allocation.getAmount()),
                        normalizeAmount(allocation.getAmount())))
                .toList();
    }

    private List<PaymentHistoryRow> buildPaymentHistory(List<BillAllocationDetailResponse> allocations) {
        if (allocations == null || allocations.isEmpty()) {
            return List.of();
        }
        return allocations.stream()
                .filter(Objects::nonNull)
                .filter(allocation -> normalizeAmount(allocation.getAmount()).signum() > 0)
                .filter(allocation -> allocation.getAllocationType() != PaymentAllocationType.REVERSAL)
                .sorted(Comparator.comparing(
                                BillAllocationDetailResponse::getConfirmedAt,
                                Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(
                                BillAllocationDetailResponse::getCreatedAt,
                                Comparator.nullsLast(Comparator.reverseOrder())))
                .map(allocation -> new PaymentHistoryRow(
                        formatDateTimeShort(
                                allocation.getConfirmedAt() != null
                                        ? allocation.getConfirmedAt()
                                        : allocation.getReceivedAt()),
                        resolvePaymentMethodLabel(allocation),
                        formatCurrency(allocation.getAmount())))
                .toList();
    }

    private AmountSummary calculateAmountSummary(List<BillLineDetailResponse> lines) {
        BigDecimal rentAmount = BigDecimal.ZERO;
        BigDecimal serviceAmount = BigDecimal.ZERO;
        BigDecimal otherAmount = BigDecimal.ZERO;
        BigDecimal discountAmount = BigDecimal.ZERO;
        BigDecimal penaltyAmount = BigDecimal.ZERO;

        if (lines == null || lines.isEmpty()) {
            return new AmountSummary(rentAmount, serviceAmount, otherAmount, discountAmount, penaltyAmount);
        }

        for (BillLineDetailResponse line : lines) {
            if (line == null) {
                continue;
            }
            BigDecimal amount = normalizeAmount(line.getAmount());
            BillLineType lineType = line.getLineType();
            if (lineType == null) {
                otherAmount = otherAmount.add(amount);
                continue;
            }
            switch (lineType) {
                case RENT -> rentAmount = rentAmount.add(amount);
                case SERVICE, UTILITY_METERED -> serviceAmount = serviceAmount.add(amount);
                case DISCOUNT -> discountAmount = discountAmount.add(amount.abs());
                case PENALTY -> penaltyAmount = penaltyAmount.add(amount);
                case MANUAL_ADJUSTMENT -> otherAmount = otherAmount.add(amount);
            }
        }
        return new AmountSummary(rentAmount, serviceAmount, otherAmount, discountAmount, penaltyAmount);
    }

    private PaymentInstructionInfo parsePaymentInstructionInfo(BillDetailResponse detail) {
        String instructions = detail != null ? detail.getPaymentInstructions() : null;
        if (!hasText(instructions)) {
            return new PaymentInstructionInfo(null, null, null, detail != null ? detail.getOwnerName() : null, null);
        }

        String bankName = null;
        String bankBranch = null;
        String bankAccountNumber = null;
        String bankAccountName = null;
        String transferContent = null;

        for (String rawLine : instructions.split("\\R")) {
            if (!hasText(rawLine)) {
                continue;
            }
            String line = rawLine.trim();
            String normalizedKey = normalizeLookupKey(extractInstructionKey(line));
            String value = extractInstructionValue(line);
            if (!hasText(value)) {
                continue;
            }
            if (bankName == null && matchesAny(normalizedKey, "nganhang", "bank")) {
                bankName = value;
                continue;
            }
            if (bankBranch == null && matchesAny(normalizedKey, "chinhanh", "branch")) {
                bankBranch = value;
                continue;
            }
            if (bankAccountNumber == null
                    && matchesAny(normalizedKey, "sotk", "sotaikhoan", "accountnumber", "accountno", "stk")) {
                bankAccountNumber = value;
                continue;
            }
            if (bankAccountName == null && matchesAny(normalizedKey, "chutk", "chutaikhoan", "accountname", "tentk")) {
                bankAccountName = value;
                continue;
            }
            if (transferContent == null
                    && matchesAny(normalizedKey, "noidung", "noidungck", "transfercontent", "reference")) {
                transferContent = value;
            }
        }

        if (!hasText(bankAccountName) && hasText(detail.getOwnerName())) {
            bankAccountName = detail.getOwnerName();
        }

        return new PaymentInstructionInfo(bankName, bankBranch, bankAccountNumber, bankAccountName, transferContent);
    }

    private String resolveTransferContent(BillDetailResponse detail, String parsedTransferContent) {
        if (hasText(parsedTransferContent)) {
            return parsedTransferContent;
        }
        String billCode = detail != null ? detail.getBillCode() : null;
        String tenantName = detail != null ? detail.getTenantName() : null;
        if (hasText(billCode) && hasText(tenantName)) {
            return billCode + " " + tenantName;
        }
        return billCode;
    }

    private String buildCashPaymentNote(BillDetailResponse detail) {
        String companyName = resolveCompanyName(detail);
        if (hasText(detail.getOwnerName())) {
            return "Có thể thanh toán trực tiếp cho " + detail.getOwnerName()
                    + ". Sau khi nhận tiền, yêu cầu ký biên nhận để đối soát.";
        }
        return "Có thể thanh toán trực tiếp tại " + companyName
                + ". Sau khi nhận tiền, yêu cầu ký biên nhận để đối soát.";
    }

    private String buildLineNote(BillLineDetailResponse line, Map<String, Object> metadata) {
        if (Boolean.TRUE.equals(metadataBoolean(metadata, "missing_meter_reading"))) {
            return "Chưa có chỉ số kỳ này";
        }

        String segment =
                buildSegmentNote(metadataString(metadata, "segmentStart"), metadataString(metadata, "segmentEnd"));
        if (hasText(segment) && line != null && line.getLineType() == BillLineType.RENT) {
            return segment;
        }

        String readingPeriod = buildSegmentNote(
                metadataString(metadata, "openingReadingDate"), metadataString(metadata, "closingReadingDate"));
        if (hasText(readingPeriod) && line != null && line.getLineType() == BillLineType.UTILITY_METERED) {
            return "Kỳ đọc: " + readingPeriod;
        }
        return null;
    }

    private String buildMeterInfo(BillLineDetailResponse line, Map<String, Object> metadata) {
        if (line == null || line.getLineType() != BillLineType.UTILITY_METERED) {
            return "—";
        }
        if (Boolean.TRUE.equals(metadataBoolean(metadata, "missing_meter_reading"))) {
            return "Thiếu chỉ số";
        }
        BigDecimal openingIndex = metadataBigDecimal(metadata, "openingIndex");
        BigDecimal closingIndex = metadataBigDecimal(metadata, "closingIndex");
        if (openingIndex != null || closingIndex != null) {
            return formatMeterValue(openingIndex) + " → " + formatMeterValue(closingIndex);
        }
        String periodStart = metadataString(metadata, "periodStart");
        String periodEnd = metadataString(metadata, "periodEnd");
        String segment = buildSegmentNote(periodStart, periodEnd);
        return hasText(segment) ? segment : "Theo chỉ số";
    }

    private String buildSegmentNote(String start, String end) {
        LocalDate startDate = parseLocalDate(start);
        LocalDate endDate = parseLocalDate(end);
        if (startDate == null && endDate == null) {
            return null;
        }
        if (startDate != null && endDate != null) {
            return formatDate(startDate) + " - " + formatDate(endDate);
        }
        return startDate != null ? formatDate(startDate) : formatDate(endDate);
    }

    private String resolveCompanyName(BillDetailResponse detail) {
        if (hasText(detail.getBoardingHouseName())) {
            return detail.getBoardingHouseName().trim();
        }
        if (hasText(detail.getOrganizationName())) {
            return detail.getOrganizationName().trim();
        }
        if (hasText(detail.getOwnerName())) {
            return detail.getOwnerName().trim();
        }
        return "EZ Trọ";
    }

    private String resolveCompanyAddress(BillDetailResponse detail) {
        if (hasText(detail.getBoardingHouseAddress())) {
            return detail.getBoardingHouseAddress().trim();
        }
        if (hasText(detail.getOwnerAddress())) {
            return detail.getOwnerAddress().trim();
        }
        return null;
    }

    private String resolveCompanyPhone(BillDetailResponse detail) {
        if (hasText(detail.getBoardingHousePhone())) {
            return detail.getBoardingHousePhone().trim();
        }
        if (hasText(detail.getOwnerPhone())) {
            return detail.getOwnerPhone().trim();
        }
        return null;
    }

    private String resolveCompanyEmail(BillDetailResponse detail) {
        return hasText(detail.getOwnerEmail()) ? detail.getOwnerEmail().trim() : null;
    }

    private String resolveOccupantsText(BillDetailResponse detail) {
        if (detail.getRoomMaxOccupants() != null && detail.getRoomMaxOccupants() > 0) {
            return "Tối đa " + detail.getRoomMaxOccupants() + " người";
        }
        return "Chưa cập nhật";
    }

    private String resolvePaymentMethodLabel(BillAllocationDetailResponse allocation) {
        if (allocation == null) {
            return "—";
        }
        if (hasText(allocation.getPaymentMethod())) {
            return translatePaymentMethod(allocation.getPaymentMethod());
        }
        return translatePaymentSource(allocation.getPaymentSource());
    }

    private Optional<Path> resolveFontPath() {
        return FONT_CANDIDATES.stream().filter(Files::isRegularFile).findFirst();
    }

    private Map<String, Object> parseMetadata(String metadataJson) {
        if (!hasText(metadataJson)) {
            return Map.of();
        }
        try {
            Object parsed = gson.fromJson(metadataJson, Object.class);
            if (parsed instanceof Map<?, ?> raw) {
                Map<String, Object> result = new LinkedHashMap<>();
                for (Map.Entry<?, ?> entry : raw.entrySet()) {
                    if (entry.getKey() != null) {
                        result.put(String.valueOf(entry.getKey()), entry.getValue());
                    }
                }
                return result;
            }
        } catch (RuntimeException ignored) {
            // metadata lỗi không được làm fail xuất tài liệu
        }
        return Map.of();
    }

    private String translateInvoiceType(InvoiceType invoiceType) {
        if (invoiceType == null) {
            return "Không xác định";
        }
        return switch (invoiceType) {
            case RENT -> "Tiền phòng";
            case PRORATION -> "Điều chỉnh theo ngày";
            case MANUAL -> "Hóa đơn bổ sung";
        };
    }

    private String translateBillStatus(BillStatus status) {
        if (status == null) {
            return "Chưa xác định";
        }
        return switch (status) {
            case PAID -> "Đã thanh toán";
            case UNPAID -> "Chưa thanh toán";
            case OVERDUE -> "Quá hạn";
            case PARTIALLY_PAID -> "Thanh toán một phần";
            case CANCELLED -> "Đã hủy";
        };
    }

    private String translateLifecycleStatus(BillLifecycleStatus status) {
        if (status == null) {
            return "Chưa phát hành";
        }
        return switch (status) {
            case ISSUED -> "Đã phát hành";
            case SENT -> "Đã gửi";
            case CANCELLED -> "Đã hủy phát hành";
        };
    }

    private String translateInvoicePaymentStatus(carevn.luv2code.ez_tro.enums.InvoicePaymentStatus status) {
        if (status == null) {
            return "Chưa ghi nhận";
        }
        return switch (status) {
            case UNPAID -> "Chưa thanh toán";
            case PARTIALLY_PAID -> "Thanh toán một phần";
            case PAID -> "Đã thanh toán";
            case OVERPAID -> "Thanh toán dư";
        };
    }

    private String translateLineType(BillLineType lineType) {
        if (lineType == null) {
            return "Khác";
        }
        return switch (lineType) {
            case RENT -> "Tiền phòng";
            case SERVICE -> "Dịch vụ cố định";
            case UTILITY_METERED -> "Điện nước";
            case MANUAL_ADJUSTMENT -> "Điều chỉnh";
            case DISCOUNT -> "Giảm trừ";
            case PENALTY -> "Phạt";
        };
    }

    private String translatePaymentSource(PaymentSource paymentSource) {
        if (paymentSource == null) {
            return "Khác";
        }
        return switch (paymentSource) {
            case NORMAL -> "Thu thông thường";
            case TENANT_SUBMITTED -> "Tenant xác nhận";
            case DEPOSIT -> "Bồi trừ cọc";
        };
    }

    private String translatePaymentStatus(PaymentStatus paymentStatus) {
        if (paymentStatus == null) {
            return "Chưa rõ";
        }
        return switch (paymentStatus) {
            case PENDING -> "Chờ duyệt";
            case CONFIRMED -> "Đã xác nhận";
            case PARTIALLY_ALLOCATED -> "Đã phân bổ một phần";
            case FULLY_ALLOCATED -> "Đã phân bổ hết";
            case OVERPAID -> "Thu vượt";
            case REVERSED -> "Đã đảo";
            case FAILED -> "Thất bại";
        };
    }

    private String translateAllocationType(PaymentAllocationType allocationType) {
        if (allocationType == null) {
            return "Khác";
        }
        return switch (allocationType) {
            case ALLOCATE -> "Phân bổ";
            case REVERSAL -> "Hoàn tác";
        };
    }

    private String translatePaymentMethod(String paymentMethod) {
        if (!hasText(paymentMethod)) {
            return "Khác";
        }
        return switch (paymentMethod.trim()) {
            case "bank_transfer" -> "Chuyển khoản";
            case "cash" -> "Tiền mặt";
            case "e_wallet" -> "Ví điện tử";
            default -> paymentMethod;
        };
    }

    private String resolveBillStatusClass(BillStatus status) {
        if (status == null) {
            return "badge-neutral";
        }
        return switch (status) {
            case PAID -> "badge-paid";
            case PARTIALLY_PAID -> "badge-partial";
            case UNPAID, OVERDUE -> "badge-unpaid";
            case CANCELLED -> "badge-neutral";
        };
    }

    private String resolveLifecycleClass(BillLifecycleStatus status) {
        if (status == null) {
            return "badge-neutral";
        }
        return switch (status) {
            case ISSUED -> "badge-primary";
            case SENT -> "badge-paid";
            case CANCELLED -> "badge-neutral";
        };
    }

    private String resolvePaymentStatusClass(carevn.luv2code.ez_tro.enums.InvoicePaymentStatus status) {
        if (status == null) {
            return "badge-neutral";
        }
        return switch (status) {
            case PAID, OVERPAID -> "badge-success";
            case PARTIALLY_PAID -> "badge-warning";
            case UNPAID -> "badge-danger";
        };
    }

    private String formatDate(LocalDate value) {
        return value == null ? "—" : DATE_FORMATTER.format(value);
    }

    private String formatDateTime(Date value) {
        return value == null
                ? "—"
                : DATE_TIME_FORMATTER.format(
                        value.toInstant().atZone(DOCUMENT_ZONE).toLocalDateTime());
    }

    private String formatDateTimeShort(Date value) {
        return value == null
                ? "—"
                : DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
                        .format(value.toInstant().atZone(DOCUMENT_ZONE).toLocalDateTime());
    }

    private String formatCurrency(BigDecimal value) {
        return String.format(VIETNAMESE, "%,.0f đ", normalizeAmount(value));
    }

    private String formatSignedCurrency(BigDecimal value) {
        BigDecimal normalized = normalizeAmount(value);
        String formatted = String.format(VIETNAMESE, "%,.0f đ", normalized.abs());
        return normalized.signum() < 0 ? "– " + formatted : formatted;
    }

    private String formatDecimal(BigDecimal value) {
        if (value == null) {
            return "—";
        }
        BigDecimal normalized = value.stripTrailingZeros();
        return normalized.scale() <= 0 ? normalized.toPlainString() : normalized.toPlainString();
    }

    private String formatMeterValue(BigDecimal value) {
        return value == null ? "—" : formatDecimal(value);
    }

    private String formatPeriod(LocalDate start, LocalDate end) {
        if (start == null && end == null) {
            return "—";
        }
        if (start != null && end != null) {
            return formatDate(start) + " - " + formatDate(end);
        }
        return start != null ? formatDate(start) : formatDate(end);
    }

    private String normalizeOptionalText(String value) {
        return hasText(value) ? value.trim() : "";
    }

    private String displayText(String value) {
        return hasText(value) ? value.trim() : "—";
    }

    private BigDecimal normalizeAmount(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private Boolean metadataBoolean(Map<String, Object> metadata, String key) {
        if (metadata == null || key == null) {
            return null;
        }
        Object value = metadata.get(key);
        if (value instanceof Boolean bool) {
            return bool;
        }
        if (value == null) {
            return null;
        }
        String normalized = String.valueOf(value).trim();
        if (normalized.equalsIgnoreCase("true")) {
            return true;
        }
        if (normalized.equalsIgnoreCase("false")) {
            return false;
        }
        return null;
    }

    private BigDecimal metadataBigDecimal(Map<String, Object> metadata, String key) {
        if (metadata == null || key == null) {
            return null;
        }
        Object value = metadata.get(key);
        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        if (value == null) {
            return null;
        }
        try {
            return new BigDecimal(String.valueOf(value).trim());
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private String metadataString(Map<String, Object> metadata, String key) {
        if (metadata == null || key == null) {
            return null;
        }
        Object value = metadata.get(key);
        if (value == null) {
            return null;
        }
        String normalized = String.valueOf(value).trim();
        return normalized.isBlank() ? null : normalized;
    }

    private LocalDate parseLocalDate(String value) {
        if (!hasText(value)) {
            return null;
        }
        try {
            return LocalDate.parse(value.trim());
        } catch (RuntimeException exception) {
            return null;
        }
    }

    private String extractInstructionKey(String line) {
        int separatorIndex = firstSeparatorIndex(line);
        if (separatorIndex < 0) {
            return line;
        }
        return line.substring(0, separatorIndex);
    }

    private String extractInstructionValue(String line) {
        int separatorIndex = firstSeparatorIndex(line);
        if (separatorIndex < 0 || separatorIndex + 1 >= line.length()) {
            return null;
        }
        return line.substring(separatorIndex + 1).trim();
    }

    private int firstSeparatorIndex(String line) {
        int colonIndex = line.indexOf(':');
        int dashIndex = line.indexOf('-');
        if (colonIndex < 0) {
            return dashIndex;
        }
        if (dashIndex < 0) {
            return colonIndex;
        }
        return Math.min(colonIndex, dashIndex);
    }

    private boolean matchesAny(String value, String... candidates) {
        if (!hasText(value) || candidates == null) {
            return false;
        }
        for (String candidate : candidates) {
            if (candidate != null && value.contains(candidate)) {
                return true;
            }
        }
        return false;
    }

    private String normalizeLookupKey(String value) {
        if (!hasText(value)) {
            return "";
        }
        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replaceAll("[^a-zA-Z0-9]+", "")
                .toLowerCase(Locale.ROOT);
    }

    private String sanitizeFileName(String value) {
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replaceAll("[^a-zA-Z0-9-_]+", "-")
                .replaceAll("-{2,}", "-")
                .replaceAll("^-|-$", "");
        return normalized.isBlank() ? "document" : normalized.toLowerCase(Locale.ROOT);
    }

    private record LineItemRow(
            int index,
            String description,
            String note,
            String typeLabel,
            String meterInfo,
            String quantity,
            String unitPrice,
            String amount) {}

    private record AllocationRow(
            String reference,
            String paymentSourceLabel,
            String paymentStatusLabel,
            String allocationTypeLabel,
            String confirmedAt,
            String amount,
            BigDecimal rawAmount) {}

    private record PaymentHistoryRow(String date, String method, String amount) {}

    private record AmountSummary(
            BigDecimal rentAmount,
            BigDecimal serviceAmount,
            BigDecimal otherAmount,
            BigDecimal discountAmount,
            BigDecimal penaltyAmount) {}

    private record PaymentInstructionInfo(
            String bankName,
            String bankBranch,
            String bankAccountNumber,
            String bankAccountName,
            String transferContent) {}
}
