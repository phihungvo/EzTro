package carevn.luv2code.ez_tro.service.admin.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.requests.InvoiceFinalizeRequest;
import carevn.luv2code.ez_tro.dto.requests.InvoicePreviewRequest;
import carevn.luv2code.ez_tro.dto.response.BillResponse;
import carevn.luv2code.ez_tro.dto.response.ContractSnapshotResponse;
import carevn.luv2code.ez_tro.dto.response.ContractVersionSummaryResponse;
import carevn.luv2code.ez_tro.dto.response.InvoiceLinePreviewResponse;
import carevn.luv2code.ez_tro.dto.response.InvoicePreviewResponse;
import carevn.luv2code.ez_tro.entity.Bill;
import carevn.luv2code.ez_tro.entity.BillLine;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.Room;
import carevn.luv2code.ez_tro.entity.Tenant;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.BillLineType;
import carevn.luv2code.ez_tro.enums.BillStatus;
import carevn.luv2code.ez_tro.enums.BillingCycle;
import carevn.luv2code.ez_tro.enums.InvoiceType;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.BillMapper;
import carevn.luv2code.ez_tro.repository.BillLineRepository;
import carevn.luv2code.ez_tro.repository.BillRepository;
import carevn.luv2code.ez_tro.repository.ContractRepository;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.BillingOrchestratorService;
import carevn.luv2code.ez_tro.service.admin.ContractSnapshotService;
import carevn.luv2code.ez_tro.service.admin.NotificationService;
import carevn.luv2code.ez_tro.service.admin.ObservabilityMetricsService;
import carevn.luv2code.ez_tro.service.admin.PaymentAllocationService;
import carevn.luv2code.ez_tro.service.admin.billing.InvoiceLineBuildResult;
import carevn.luv2code.ez_tro.service.admin.billing.InvoiceLineBuilder;
import carevn.luv2code.ez_tro.service.admin.payment.InvoiceBalanceCalculator;
import carevn.luv2code.ez_tro.util.BillingIntegrityUtils;
import carevn.luv2code.ez_tro.util.BillingKeyUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service điều phối tính tiền và lập hóa đơn (invoice/billing orchestrator).
 *
 * <p>Mục tiêu của lớp này:
 * <ul>
 *   <li>Dựng preview invoice (không ghi DB) dựa trên snapshot hợp đồng tại một thời điểm.</li>
 *   <li>Finalize invoice: tạo/cập nhật {@link Bill} và {@link BillLine} theo generation key.</li>
 *   <li>Batch generate invoices theo tháng và áp dụng phí phạt trễ hạn (late penalties).</li>
 * </ul>
 *
 * <p>Lớp này giữ logic điều phối; chi tiết dựng line items nằm ở {@link InvoiceLineBuilder}.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BillingOrchestratorServiceImpl implements BillingOrchestratorService {

    private static final DateTimeFormatter BASIC_DATE = DateTimeFormatter.BASIC_ISO_DATE;

    private final ContractRepository contractRepository;
    private final BillRepository billRepository;
    private final BillLineRepository billLineRepository;
    private final ContractSnapshotService contractSnapshotService;
    private final InvoiceLineBuilder invoiceLineBuilder;
    private final BillMapper billMapper;
    private final NotificationService notificationService;
    private final InvoiceBalanceCalculator invoiceBalanceCalculator;
    private final PaymentAllocationService paymentAllocationService;
    private final ObservabilityMetricsService observabilityMetricsService;

    @Value("${app.billing.penalty.grace-days:0}")
    private int penaltyGraceDays;

    @Value("${app.billing.penalty.fixed-fee:0}")
    private BigDecimal penaltyFixedFee;

    @Value("${app.billing.penalty.percent-fee:0}")
    private BigDecimal penaltyPercentFee;

    private record PeriodResolution(
            LocalDate billingPeriodStart,
            LocalDate billingPeriodEnd,
            LocalDate dueDate,
            BillingCycle billingCycle,
            InvoiceType invoiceType,
            String generationKey) {}

    /**
     * Preview invoice: tính toán line items và tổng tiền nhưng không ghi DB.
     *
     * @param request payload preview
     * @return dữ liệu preview invoice
     */
    @Override
    @Transactional(readOnly = true)
    public InvoicePreviewResponse previewInvoice(InvoicePreviewRequest request) {
        Contract contract = contractRepository
                .findById(request.getContractId())
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));

        validateContractAccess(contract);

        LocalDate asOfDate = resolveAsOfDate(request.getAsOfDate());
        ContractSnapshotResponse snapshot = loadSnapshot(contract, asOfDate);

        PeriodResolution period = resolvePeriod(contract, snapshot, request, request.getInvoiceType());
        InvoiceLineBuildResult buildResult = invoiceLineBuilder.buildLines(
                contract, snapshot, period.billingPeriodStart, period.billingPeriodEnd, period.invoiceType, request);
        BillingIntegrityUtils.validateBillAmountMatchesLines(buildResult.getTotalAmount(), buildResult.getLines());

        return InvoicePreviewResponse.builder()
                .contractId(contract.getId())
                .organizationId(snapshot.getOrganizationId())
                .invoiceType(period.invoiceType)
                .billingPeriodStart(period.billingPeriodStart)
                .billingPeriodEnd(period.billingPeriodEnd)
                .dueDate(period.dueDate)
                .generationKey(period.generationKey)
                .totalAmount(buildResult.getTotalAmount())
                .rentAmount(buildResult.getRentAmount())
                .serviceAmount(buildResult.getServiceAmount())
                .discountAmount(buildResult.getDiscountAmount())
                .penaltyAmount(buildResult.getPenaltyAmount())
                .hasMissingMeterReadings(buildResult.isHasMissingMeterReadings())
                .lines(buildResult.getLines().stream().map(this::toLinePreview).toList())
                .build();
    }

    /**
     * Finalize invoice: tạo/cập nhật bill + bill lines trong DB theo thông tin request.
     *
     * <p>Thường sẽ:
     * <ul>
     *   <li>Dựng lại preview request để tính line items.</li>
     *   <li>Tạo mới bill hoặc update bill hiện có theo generationKey/billing period.</li>
     * </ul>
     *
     * @param request payload finalize
     * @return bill DTO sau khi finalize
     */
    @Override
    @Transactional
    public BillResponse finalizeInvoice(InvoiceFinalizeRequest request) {
        Contract contract = contractRepository
                .findById(request.getContractId())
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));

        validateContractAccess(contract);

        LocalDate asOfDate = resolveAsOfDate(request.getAsOfDate());
        ContractSnapshotResponse snapshot = loadSnapshot(contract, asOfDate);
        InvoicePreviewRequest previewRequest = buildPreviewRequestFromFinalize(request, asOfDate);

        PeriodResolution period = resolvePeriod(contract, snapshot, previewRequest, request.getInvoiceType());
        Bill bill = createOrUpdateInvoice(contract, snapshot, period, previewRequest);
        if (bill != null) {
            paymentAllocationService.applyCarryForwardCredits(bill.getId());
        }
        return billMapper.toResponse(bill);
    }

    /**
     * Batch tạo/cập nhật invoices cho tất cả hợp đồng active tại một thời điểm.
     *
     * @param asOfDate ngày chạy batch (null -> today)
     * @return số hợp đồng đã được tạo/cập nhật bill
     */
    @Override
    @Transactional
    public int generateInvoices(LocalDate asOfDate) {
        LocalDate effectiveDate = resolveAsOfDate(asOfDate);
        YearMonth ym = YearMonth.from(effectiveDate);
        LocalDate monthStart = ym.atDay(1);
        LocalDate monthEnd = ym.atEndOfMonth();

        List<Contract> activeContracts = contractRepository.findActiveContractsForBilling(monthStart, monthEnd);

        int createdOrUpdated = 0;
        for (Contract contract : activeContracts) {
            try {
                ContractSnapshotResponse snapshot = loadSnapshot(contract, effectiveDate);
                PeriodResolution period = resolvePeriod(
                        contract,
                        snapshot,
                        InvoicePreviewRequest.builder()
                                .contractId(contract.getId())
                                .asOfDate(effectiveDate)
                                .invoiceType(InvoiceType.RENT)
                                .build(),
                        InvoiceType.RENT);

                InvoicePreviewRequest previewRequest =
                        buildPreviewRequestForGenerate(contract.getId(), effectiveDate, period);
                Bill bill = createOrUpdateInvoice(contract, snapshot, period, previewRequest);
                if (bill != null) {
                    paymentAllocationService.applyCarryForwardCredits(bill.getId());
                    createdOrUpdated++;
                }
            } catch (Exception e) {
                observabilityMetricsService.incrementBillingFailure(
                        contract, "generate_invoices", resolveFailureReason(e));
                log.error("Billing orchestrator failed for contract {}: {}", contract.getId(), e.getMessage(), e);
            }
        }

        return createdOrUpdated;
    }

    /**
     * Áp dụng phí phạt trễ hạn cho các bill quá hạn (chưa PAID) dựa trên cấu hình.
     *
     * @param asOfDate ngày chạy batch (null -> today)
     * @return số bill đã áp dụng penalty line
     */
    @Override
    @Transactional
    public int applyLatePenalties(LocalDate asOfDate) {
        LocalDate today = resolveAsOfDate(asOfDate);

        if (penaltyFixedFee == null) {
            penaltyFixedFee = BigDecimal.ZERO;
        }
        if (penaltyPercentFee == null) {
            penaltyPercentFee = BigDecimal.ZERO;
        }

        if (penaltyFixedFee.signum() <= 0 && penaltyPercentFee.signum() <= 0) {
            return 0;
        }

        LocalDate cutoff = today.minusDays(Math.max(0, penaltyGraceDays));
        List<Bill> overdueBills = billRepository.findByStatusNotAndDueDateBefore(BillStatus.PAID, cutoff);

        int applied = 0;
        for (Bill bill : overdueBills) {
            try {
                if (bill.getStatus() == BillStatus.CANCELLED) {
                    // Không áp dụng phạt cho hóa đơn đã hủy.
                    continue;
                }
                if (bill.getAmount() == null || bill.getAmount().signum() <= 0) {
                    continue;
                }

                LocalDate start = bill.getBillingPeriodStart();
                LocalDate end = bill.getBillingPeriodEnd();
                String lineKey = "PENALTY_" + Objects.toString(start, "") + "_" + Objects.toString(end, "");
                if (billLineRepository.existsByBillIdAndLineKey(bill.getId(), lineKey)) {
                    continue;
                }

                BigDecimal outstanding =
                        invoiceBalanceCalculator.calculate(bill).getOutstandingAmount();
                if (outstanding == null || outstanding.signum() <= 0) {
                    continue;
                }
                BigDecimal percentFee = outstanding.multiply(penaltyPercentFee);
                BigDecimal penalty = penaltyFixedFee.add(percentFee).setScale(2, RoundingMode.HALF_UP);
                if (penalty.signum() <= 0) {
                    continue;
                }

                BillLine line = BillLine.builder()
                        .bill(bill)
                        .lineType(BillLineType.PENALTY)
                        .lineKey(lineKey)
                        .description("Phạt trễ hạn")
                        .quantity(BigDecimal.ONE)
                        .unitPrice(penalty)
                        .amount(penalty)
                        .metadataJson("{\"graceDays\":" + penaltyGraceDays + "}")
                        .build();

                billLineRepository.save(line);
                bill.setAmount(bill.getAmount().add(penalty));
                billRepository.save(bill);
                applied++;
                Tenant tenant = bill.getTenant();
                if (tenant != null && tenant.getUser() != null) {
                    notificationService.sendToUser(
                            tenant.getUser().getId(),
                            "Hoá đơn quá hạn",
                            "Phòng " + bill.getRoom().getRoomNumber() + " bị phạt trễ hạn " + penalty + "đ",
                            "BILL_OVERDUE",
                            Map.of("billId", bill.getId(), "penalty", penalty, "outstanding", outstanding));
                }
            } catch (Exception e) {
                observabilityMetricsService.incrementBillingFailure(
                        bill.getContract(), "apply_penalty", resolveFailureReason(e));
                log.error("Failed applying penalty for bill {}: {}", bill.getId(), e.getMessage(), e);
            }
        }

        return applied;
    }

    // Dùng chung để thống nhất cách lấy ngày "as of" (null -> hôm nay).
    private LocalDate resolveAsOfDate(LocalDate asOfDate) {
        return asOfDate != null ? asOfDate : LocalDate.now();
    }

    // Load snapshot để đảm bảo tính nhất quán khi tính tiền theo thời điểm.
    private ContractSnapshotResponse loadSnapshot(Contract contract, LocalDate asOfDate) {
        return contractSnapshotService.getSnapshot(contract.getId(), asOfDate);
    }

    // Chuyển finalize request về preview request để tái sử dụng flow build line.
    private InvoicePreviewRequest buildPreviewRequestFromFinalize(InvoiceFinalizeRequest request, LocalDate asOfDate) {
        return InvoicePreviewRequest.builder()
                .contractId(request.getContractId())
                .asOfDate(asOfDate)
                .billingPeriodStart(request.getBillingPeriodStart())
                .billingPeriodEnd(request.getBillingPeriodEnd())
                .dueDate(request.getDueDate())
                .invoiceType(request.getInvoiceType())
                .extraAmount(request.getExtraAmount())
                .discountAmount(request.getDiscountAmount())
                .discountReason(request.getDiscountReason())
                .publicNote(request.getPublicNote())
                .internalNote(request.getInternalNote())
                .build();
    }

    // Build preview request cho batch generate sau khi đã resolve kỳ và hạn thanh toán.
    private InvoicePreviewRequest buildPreviewRequestForGenerate(
            Integer contractId, LocalDate asOfDate, PeriodResolution period) {
        return InvoicePreviewRequest.builder()
                .contractId(contractId)
                .asOfDate(asOfDate)
                .billingPeriodStart(period.billingPeriodStart)
                .billingPeriodEnd(period.billingPeriodEnd)
                .dueDate(period.dueDate)
                .invoiceType(period.invoiceType)
                .build();
    }

    private InvoiceLinePreviewResponse toLinePreview(BillLine line) {
        return InvoiceLinePreviewResponse.builder()
                .lineType(line.getLineType())
                .lineKey(line.getLineKey())
                .description(line.getDescription())
                .quantity(line.getQuantity())
                .unitPrice(line.getUnitPrice())
                .amount(line.getAmount())
                .utilityId(line.getUtilityId())
                .metadataJson(line.getMetadataJson())
                .build();
    }

    private void validateContractAccess(Contract contract) {
        SecurityUtils.SpecificationSafeUser safe = SecurityUtils.safeUser();
        if (safe.isAdmin()) {
            return;
        }

        Room room = contract.getRoom();
        Integer ownerId = room != null
                        && room.getBoardingHouse() != null
                        && room.getBoardingHouse().getOwner() != null
                ? room.getBoardingHouse().getOwner().getId()
                : null;

        if (ownerId == null || safe.getId() == null || !ownerId.equals(safe.getId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
    }

    private PeriodResolution resolvePeriod(
            Contract contract,
            ContractSnapshotResponse snapshot,
            InvoicePreviewRequest request,
            InvoiceType invoiceTypeOverride) {
        LocalDate asOfDate = request.getAsOfDate() != null ? request.getAsOfDate() : LocalDate.now();

        ContractVersionSummaryResponse version = snapshot != null ? snapshot.getCurrentVersion() : null;
        BillingCycle billingCycle =
                version != null && version.getBillingCycle() != null ? version.getBillingCycle() : BillingCycle.MONTHLY;
        int paymentCycleMonths = resolvePaymentCycleMonths(contract, version);

        LocalDate billingPeriodStart = request.getBillingPeriodStart();
        LocalDate billingPeriodEnd = request.getBillingPeriodEnd();

        if (billingPeriodStart == null || billingPeriodEnd == null) {
            BillingPeriod period =
                    resolveBillingPeriodForDate(asOfDate, billingCycle, paymentCycleMonths, contract.getStartDate());
            billingPeriodStart = period.start();
            billingPeriodEnd = period.end();
        }

        InvoiceType invoiceType = invoiceTypeOverride != null ? invoiceTypeOverride : InvoiceType.RENT;

        LocalDate dueDate = request.getDueDate();
        if (dueDate == null) {
            dueDate = resolveDueDate(contract, version, billingCycle, billingPeriodStart, billingPeriodEnd);
        }

        Integer orgId = snapshot != null ? snapshot.getOrganizationId() : null;
        String generationKey = BillingKeyUtils.buildGenerationKey(
                orgId, contract.getId(), billingPeriodStart, billingPeriodEnd, invoiceType);

        return new PeriodResolution(
                billingPeriodStart, billingPeriodEnd, dueDate, billingCycle, invoiceType, generationKey);
    }

    private Bill createOrUpdateInvoice(
            Contract contract,
            ContractSnapshotResponse snapshot,
            PeriodResolution period,
            InvoicePreviewRequest previewRequest) {
        if (period == null) {
            return null;
        }

        InvoiceLineBuildResult buildResult = invoiceLineBuilder.buildLines(
                contract,
                snapshot,
                period.billingPeriodStart,
                period.billingPeriodEnd,
                period.invoiceType,
                previewRequest);
        BillingIntegrityUtils.validateBillAmountMatchesLines(buildResult.getTotalAmount(), buildResult.getLines());

        if (buildResult.isHasMissingMeterReadings()) {
            // Không cho finalize nếu thiếu chỉ số công tơ để tránh phát hành hóa đơn sai.
            throw new AppException(ErrorCode.BILL_MISSING_METER_READING);
        }

        if (buildResult.getTotalAmount() == null || buildResult.getTotalAmount().signum() <= 0) {
            return null;
        }

        Bill existing = billRepository.findByGenerationKey(period.generationKey).orElse(null);
        if (existing != null) {
            if (existing.getStatus() == BillStatus.PAID) {
                return existing;
            }
            if (existing.getStatus() == BillStatus.CANCELLED) {
                // Không tự "hồi sinh" hóa đơn đã hủy.
                return existing;
            }
            // Nếu đã có phân bổ thanh toán thì không được rebuild lines để tránh sai lệch đối soát.
            BigDecimal allocated = invoiceBalanceCalculator.calculate(existing).getAllocatedAmount();
            if (allocated != null && allocated.signum() > 0) {
                return existing;
            }
            return updateExistingBill(existing, contract, period, buildResult, previewRequest);
        }

        Bill bill = new Bill();
        bill.setBillTitle(buildBillTitle(period.billingPeriodStart, period.billingPeriodEnd, period.invoiceType));
        bill.setBillCode(buildBillCode(
                contract.getId(), period.invoiceType, period.billingPeriodStart, period.billingPeriodEnd));
        bill.setContract(contract);
        bill.setRoom(contract.getRoom());
        bill.setTenant(contract.getTenant());
        bill.setBillingPeriodStart(period.billingPeriodStart);
        bill.setBillingPeriodEnd(period.billingPeriodEnd);
        bill.setGenerationKey(period.generationKey);
        bill.setInvoiceType(period.invoiceType);
        bill.setDueDate(period.dueDate);
        bill.setStatus(BillStatus.UNPAID);
        bill.setServiceAmount(nullToZero(buildResult.getServiceAmount()));
        bill.setAmount(buildResult.getTotalAmount());
        bill.setNote(buildInvoiceNote(previewRequest));

        List<BillLine> lines = buildResult.getLines();
        if (lines != null) {
            for (BillLine line : lines) {
                line.setBill(bill);
            }
            bill.setLines(lines);
        }
        BillingIntegrityUtils.validateBillAmountMatchesLines(bill.getAmount(), bill.getLines());

        Bill saved = billRepository.save(bill);
        observabilityMetricsService.incrementInvoiceGenerated(contract, period.invoiceType, "create");
        dispatchInvoiceNotification(saved);
        return saved;
    }

    private Bill updateExistingBill(
            Bill existing,
            Contract contract,
            PeriodResolution period,
            InvoiceLineBuildResult buildResult,
            InvoicePreviewRequest previewRequest) {

        billLineRepository.deleteByBillId(existing.getId());

        existing.setContract(contract);
        existing.setRoom(contract.getRoom());
        existing.setTenant(contract.getTenant());
        existing.setBillingPeriodStart(period.billingPeriodStart);
        existing.setBillingPeriodEnd(period.billingPeriodEnd);
        existing.setInvoiceType(period.invoiceType);
        existing.setDueDate(period.dueDate);
        existing.setServiceAmount(nullToZero(buildResult.getServiceAmount()));
        existing.setAmount(buildResult.getTotalAmount());
        existing.setNote(buildInvoiceNote(previewRequest));
        existing.setStatus(existing.getStatus() == null ? BillStatus.UNPAID : existing.getStatus());

        List<BillLine> lines = buildResult.getLines();
        if (lines != null) {
            for (BillLine line : lines) {
                line.setBill(existing);
            }
        }
        existing.setLines(lines);
        BillingIntegrityUtils.validateBillAmountMatchesLines(existing.getAmount(), existing.getLines());

        Bill saved = billRepository.save(existing);
        observabilityMetricsService.incrementInvoiceGenerated(contract, period.invoiceType, "update");
        return saved;
    }

    private String resolveFailureReason(Exception exception) {
        if (exception instanceof AppException appException && appException.getErrorCode() != null) {
            return appException.getErrorCode().name();
        }
        return exception.getClass().getSimpleName();
    }

    private void dispatchInvoiceNotification(Bill bill) {
        Tenant tenant = bill.getTenant();
        if (tenant == null || tenant.getUser() == null) {
            return;
        }

        notificationService.sendToUser(
                tenant.getUser().getId(),
                "Hóa đơn mới",
                "Phòng " + bill.getRoom().getRoomNumber() + " - " + bill.getAmount() + "đ - Hạn: " + bill.getDueDate(),
                "BILL_CREATED",
                Map.of(
                        "billId",
                        bill.getId(),
                        "roomNumber",
                        bill.getRoom().getRoomNumber(),
                        "generationKey",
                        Objects.toString(bill.getGenerationKey(), "")));

        User owner = resolveOwner(bill);
        if (owner != null) {
            notificationService.sendToUser(
                    owner.getId(),
                    "Tạo hóa đơn mới",
                    "Hóa đơn phòng " + bill.getRoom().getRoomNumber() + " đã được tạo (" + bill.getAmount() + "đ)",
                    "BILL_CREATED_OWNER",
                    Map.of(
                            "billId",
                            bill.getId(),
                            "contractId",
                            bill.getContract() != null ? bill.getContract().getId() : null,
                            "generationKey",
                            Objects.toString(bill.getGenerationKey(), "")));
        }
    }

    private User resolveOwner(Bill bill) {
        if (bill == null || bill.getRoom() == null || bill.getRoom().getBoardingHouse() == null) {
            return null;
        }
        return bill.getRoom().getBoardingHouse().getOwner();
    }

    private BillingPeriod resolveBillingPeriodForDate(
            LocalDate asOfDate, BillingCycle billingCycle, int paymentCycleMonths, LocalDate contractStart) {
        if (billingCycle == BillingCycle.DAILY) {
            return new BillingPeriod(asOfDate, asOfDate);
        }
        if (billingCycle == BillingCycle.WEEKLY) {
            LocalDate start = asOfDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            return new BillingPeriod(start, start.plusDays(6));
        }

        int cycleMonths = Math.max(paymentCycleMonths, 1);

        // Với chu kỳ nhiều tháng, anchor theo tháng bắt đầu hợp đồng để giữ tính nhất quán theo thời gian.
        LocalDate anchorDate = contractStart != null ? contractStart : asOfDate;
        YearMonth anchorYm = YearMonth.from(anchorDate);
        YearMonth effectiveYm = YearMonth.from(asOfDate);
        int monthsBetween = (effectiveYm.getYear() - anchorYm.getYear()) * 12
                + (effectiveYm.getMonthValue() - anchorYm.getMonthValue());
        if (monthsBetween < 0) {
            monthsBetween = 0;
        }

        int cyclesSince = monthsBetween / cycleMonths;
        YearMonth cycleStartYm = anchorYm.plusMonths((long) cyclesSince * cycleMonths);
        YearMonth cycleEndYm = cycleStartYm.plusMonths(cycleMonths - 1L);
        return new BillingPeriod(cycleStartYm.atDay(1), cycleEndYm.atEndOfMonth());
    }

    private int resolvePaymentCycleMonths(Contract contract, ContractVersionSummaryResponse version) {
        Integer months = version != null ? version.getPaymentCycleMonths() : null;
        if (months == null || months <= 0) {
            months = contract != null ? contract.getPaymentCycleMonths() : null;
        }
        return months == null || months <= 0 ? 1 : months;
    }

    private LocalDate resolveDueDate(
            Contract contract,
            ContractVersionSummaryResponse version,
            BillingCycle billingCycle,
            LocalDate billingPeriodStart,
            LocalDate billingPeriodEnd) {
        if (billingCycle != BillingCycle.MONTHLY) {
            return billingPeriodEnd;
        }

        Integer monthlyPaymentDay = version != null && version.getMonthlyPaymentDay() != null
                ? version.getMonthlyPaymentDay()
                : contract.getMonthlyPaymentDay();

        if (monthlyPaymentDay == null || monthlyPaymentDay <= 0) {
            return billingPeriodEnd;
        }

        YearMonth ym = YearMonth.from(billingPeriodEnd);
        int day = Math.min(monthlyPaymentDay, ym.lengthOfMonth());
        LocalDate dueDate = ym.atDay(day);

        LocalDate usageStart =
                contract.getStartDate() != null && contract.getStartDate().isAfter(billingPeriodStart)
                        ? contract.getStartDate()
                        : billingPeriodStart;

        return dueDate.isBefore(usageStart) ? usageStart : dueDate;
    }

    private String buildBillTitle(LocalDate billingPeriodStart, LocalDate billingPeriodEnd, InvoiceType invoiceType) {
        if (invoiceType == InvoiceType.PRORATION) {
            return "Hóa đơn pro-rate (" + billingPeriodStart + " → " + billingPeriodEnd + ")";
        }
        if (billingPeriodStart != null
                && billingPeriodEnd != null
                && billingPeriodStart.getMonth() == billingPeriodEnd.getMonth()) {
            return "Hóa đơn tháng "
                    + String.format("%02d/%d", billingPeriodStart.getMonthValue(), billingPeriodStart.getYear());
        }
        return "Hóa đơn (" + Objects.toString(billingPeriodStart, "") + " → " + Objects.toString(billingPeriodEnd, "")
                + ")";
    }

    private String buildBillCode(
            Integer contractId, InvoiceType invoiceType, LocalDate billingPeriodStart, LocalDate billingPeriodEnd) {
        String start = billingPeriodStart != null ? billingPeriodStart.format(BASIC_DATE) : "NA";
        String end = billingPeriodEnd != null ? billingPeriodEnd.format(BASIC_DATE) : "NA";
        return "INV-" + contractId + "-" + invoiceType + "-" + start + "-" + end;
    }

    private String buildInvoiceNote(InvoicePreviewRequest request) {
        if (request == null) {
            return null;
        }

        String publicNote = request.getPublicNote();
        String internalNote = request.getInternalNote();

        if ((publicNote == null || publicNote.isBlank()) && (internalNote == null || internalNote.isBlank())) {
            return null;
        }

        StringBuilder sb = new StringBuilder();
        if (publicNote != null && !publicNote.isBlank()) {
            sb.append(publicNote.trim());
        }
        if (internalNote != null && !internalNote.isBlank()) {
            if (sb.length() > 0) {
                sb.append("\n\n");
            }
            sb.append("[INTERNAL] ").append(internalNote.trim());
        }
        return sb.toString();
    }

    private BigDecimal nullToZero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private record BillingPeriod(LocalDate start, LocalDate end) {}
}
