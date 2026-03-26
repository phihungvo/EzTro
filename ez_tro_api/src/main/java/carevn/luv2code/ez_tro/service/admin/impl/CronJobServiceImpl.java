package carevn.luv2code.ez_tro.service.admin.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.quartz.*;
import org.quartz.impl.StdSchedulerFactory;
import org.quartz.impl.matchers.GroupMatcher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.entity.*;
import carevn.luv2code.ez_tro.enums.ContractStatus;
import carevn.luv2code.ez_tro.enums.RoomStatus;
import carevn.luv2code.ez_tro.repository.*;
import carevn.luv2code.ez_tro.service.admin.BillingOrchestratorService;
import carevn.luv2code.ez_tro.service.admin.ContractService;
import carevn.luv2code.ez_tro.service.admin.ContractSnapshotService;
import carevn.luv2code.ez_tro.service.admin.CronJobService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

/**
 * Service quản lý cron/quartz job và các batch job chạy định kỳ.
 *
 * <p>Lớp này hiện đảm nhiệm:
 * <ul>
 *   <li>Schedule/update/delete job Quartz runtime.</li>
 *   <li>Job định kỳ đồng bộ trạng thái hợp đồng (PENDING/ACTIVE/EXPIRED) theo ngày hiện tại.</li>
 *   <li>Job tạo hóa đơn hàng tháng + áp dụng penalty thông qua {@link BillingOrchestratorService}.</li>
 *   <li>Job auto-renew hợp đồng nếu bật autoRenew.</li>
 * </ul>
 */
@Service
@Slf4j
public class CronJobServiceImpl implements CronJobService {
    private final ContractRepository contractRepository;
    private final RoomRepository roomRepository;
    //    private final AmenityRepository amenityRepository;
    //    private final RoomAmenityRepository roomAmenityRepository;
    //    private final ElectricWaterRecordRepository electricWaterRecordRepository;
    private final BillRepository billRepository;
    private final ContractSnapshotService contractSnapshotService;
    private final ContractService contractService;
    private final BillingOrchestratorService billingOrchestratorService;

    @Autowired
    private Scheduler scheduler;

    @Value("${app.jobs.contract-status-sync.batch-size:100}")
    private int contractStatusSyncBatchSize;

    @Value("${app.jobs.billing.quartz.enabled:false}")
    private boolean billingQuartzEnabled;

    @Value("${app.jobs.billing.quartz.cron:0 0 1 * * ?}")
    private String billingQuartzCron;

    public CronJobServiceImpl(
            ContractRepository contractRepository,
            RoomRepository roomRepository,
            //            AmenityRepository amenityRepository,
            //            RoomAmenityRepository roomAmenityRepository,
            //            ElectricWaterRecordRepository electricWaterRecordRepository,
            BillRepository billRepository,
            ContractSnapshotService contractSnapshotService,
            ContractService contractService,
            BillingOrchestratorService billingOrchestratorService)
            throws SchedulerException {
        this.contractRepository = contractRepository;
        this.roomRepository = roomRepository;
        //        this.amenityRepository = amenityRepository;
        //        this.roomAmenityRepository = roomAmenityRepository;
        //        this.electricWaterRecordRepository = electricWaterRecordRepository;
        this.billRepository = billRepository;
        this.contractSnapshotService = contractSnapshotService;
        this.contractService = contractService;
        this.billingOrchestratorService = billingOrchestratorService;
        scheduler = StdSchedulerFactory.getDefaultScheduler();
        scheduler.start();
    }

    @PostConstruct
    public void initDefaultBillJob() {
        if (!billingQuartzEnabled) {
            return;
        }

        scheduleBillGenerationJob(billingQuartzCron);
        log.info("Auto-scheduled bill generation job with cron: {}", billingQuartzCron);
    }

    /**
     * Schedule một job với {@code jobId} và cron expression.
     *
     * @param jobId id job
     * @param cronExpression cron expression Quartz
     * @param task runnable cần chạy (hiện chỉ dùng để log/debug)
     */
    @Override
    public void scheduleJob(String jobId, String cronExpression, Runnable task) {
        try {
            JobDetail jobDetail = JobBuilder.newJob(RunnableJob.class)
                    .withIdentity(jobId)
                    .usingJobData("task", task.toString())
                    .build();

            Trigger trigger = TriggerBuilder.newTrigger()
                    .withIdentity(jobId)
                    .withSchedule(CronScheduleBuilder.cronSchedule(cronExpression))
                    .build();

            scheduler.scheduleJob(jobDetail, trigger);
        } catch (SchedulerException e) {
            throw new RuntimeException("Failed to schedule job: " + jobId, e);
        }
    }

    /**
     * Update cron expression cho một job đã schedule.
     *
     * @param jobId id job
     * @param cronExpression cron expression Quartz
     */
    @Override
    public void updateJob(String jobId, String cronExpression) {
        try {
            Trigger newTrigger = TriggerBuilder.newTrigger()
                    .withIdentity(jobId)
                    .withSchedule(CronScheduleBuilder.cronSchedule(cronExpression))
                    .build();

            scheduler.rescheduleJob(new TriggerKey(jobId), newTrigger);
        } catch (SchedulerException e) {
            throw new RuntimeException("Failed to update job: " + jobId, e);
        }
    }

    /**
     * Xóa một job đã schedule.
     *
     * @param jobId id job
     */
    @Override
    public void deleteJob(String jobId) {
        try {
            scheduler.deleteJob(new JobKey(jobId));
        } catch (SchedulerException e) {
            throw new RuntimeException("Failed to delete job: " + jobId, e);
        }
    }

    /**
     * Liệt kê danh sách job đã schedule.
     *
     * @return danh sách jobId
     */
    @Override
    public List<String> listScheduledJobs() {
        try {
            return scheduler.getJobKeys(GroupMatcher.anyGroup()).stream()
                    .map(JobKey::getName)
                    .collect(Collectors.toList());
        } catch (SchedulerException e) {
            throw new RuntimeException("Failed to list scheduled jobs", e);
        }
    }

    /**
     * Kiểm tra một job có tồn tại trong scheduler hay không.
     *
     * @param jobId id job
     * @return true nếu tồn tại
     */
    @Override
    public boolean isJobScheduled(String jobId) {
        try {
            return scheduler.checkExists(new JobKey(jobId));
        } catch (SchedulerException e) {
            throw new RuntimeException("Failed to check if job is scheduled: " + jobId, e);
        }
    }

    /**
     * Lấy thông tin chi tiết của job (string).
     *
     * @param jobId id job
     * @return thông tin job hoặc "Job not found"
     */
    @Override
    public String getJobDetails(String jobId) {
        try {
            JobDetail jobDetail = scheduler.getJobDetail(new JobKey(jobId));
            return jobDetail != null ? jobDetail.toString() : "Job not found";
        } catch (SchedulerException e) {
            throw new RuntimeException("Failed to get job details: " + jobId, e);
        }
    }

    /**
     * Schedule job tạo hóa đơn định kỳ theo cron expression.
     *
     * @param cronExpression cron expression Quartz
     */
    @Override
    @Transactional
    public void scheduleBillGenerationJob(String cronExpression) {
        Runnable billTask = this::generateMonthlyBills;
        String jobId = "bill-generation";
        scheduleJob(jobId, cronExpression, billTask);
        log.info("Scheduled bill generation job with cron: {}", cronExpression);
    }

    /**
     * Scheduled task: đồng bộ trạng thái hợp đồng theo ngày hiện tại.
     */
    @Scheduled(cron = "${app.jobs.contract-status-sync.cron:0 10 0 * * *}")
    public void runDailyContractStatusSync() {
        int updated = syncContractStatusesDaily();
        log.info("Daily contract status sync completed. Updated {} contract(s).", updated);
    }

    /**
     * Scheduled task: chạy auto-renew hợp đồng theo ngày.
     */
    @Scheduled(cron = "${app.jobs.contract-auto-renew.cron:0 20 0 * * *}")
    public void scheduledContractAutoRenewal() {
        int renewed = runDailyContractAutoRenewal();
        log.info("Daily contract auto-renew completed. Renewed {} contract(s).", renewed);
    }

    /**
     * Chạy auto-renew hợp đồng (gọi về {@link ContractService#processAutoRenewals(LocalDate)}).
     *
     * @return số hợp đồng được renew
     */
    @Transactional
    public int runDailyContractAutoRenewal() {
        return contractService.processAutoRenewals(LocalDate.now());
    }

    /**
     * Đồng bộ trạng thái hợp đồng theo ngày hiện tại (batch).
     *
     * <p>Luồng này cập nhật status contract và đồng bộ trạng thái phòng (AVAILABLE/OCCUPIED) theo hợp đồng hiệu lực.
     *
     * @return số hợp đồng đã được update trạng thái
     */
    @Override
    @Transactional
    public int syncContractStatusesDaily() {
        LocalDate today = LocalDate.now();
        int totalUpdated = 0;

        while (true) {
            List<Contract> batch = contractRepository.findContractsNeedingStatusSync(
                    today, PageRequest.of(0, contractStatusSyncBatchSize));
            if (batch.isEmpty()) {
                break;
            }

            Set<Integer> touchedRoomIds = new HashSet<>();
            for (Contract contract : batch) {
                ContractStatus nextStatus = resolveStatusForToday(contract, today);
                if (contract.getStatus() == nextStatus) {
                    continue;
                }

                contract.setStatus(nextStatus);
                touchedRoomIds.add(contract.getRoom().getId());
                totalUpdated++;
            }

            contractRepository.saveAll(batch);

            for (Integer roomId : touchedRoomIds) {
                roomRepository.findById(roomId).ifPresent(room -> syncRoomOccupancyStatus(room, today));
            }

            log.info("Processed contract status sync batch with {} record(s).", batch.size());
        }

        return totalUpdated;
    }

    /**
     * Batch tạo hóa đơn và áp dụng penalty cho tháng hiện tại.
     */
    public void generateMonthlyBills() {
        LocalDate now = LocalDate.now();
        int invoices = billingOrchestratorService.generateInvoices(now);
        int penalties = billingOrchestratorService.applyLatePenalties(now);
        log.info("Quartz bill generation completed. invoices={}, penalties={}", invoices, penalties);
    }

    /**
     * Helper (legacy): tính tổng phí dịch vụ của phòng theo kỳ.
     *
     * <p>Hiện tại phần amenities/usage-based đang được comment out (tích hợp cũ).
     *
     * @param room phòng
     * @param month tháng
     * @param year năm
     * @return tổng phí dịch vụ
     */
    public BigDecimal calculateServiceAmount(Room room, int month, int year) {
        BigDecimal total = BigDecimal.ZERO;

        // Amenities (fixed/usage)
        //        List<RoomAmenity> roomAmens = roomAmenityRepository.findActiveByRoomId(room.getId(), month, year);
        //        for (RoomAmenity ra : roomAmens) {
        //            Amenity amen = ra.getAmenity();
        //            if (amen == null) continue;
        //            BigDecimal price;
        //            if (amen.getType() == ServiceType.USAGE_BASED) {
        //                if ("Điện".equals(amen.getName()) || "Nước".equals(amen.getName())) {
        //                    Optional<ElectricWaterRecord> recordOpt =
        //                            electricWaterRecordRepository.findByRoomAndMonthYear(room, month, year);
        //                    if (recordOpt.isPresent()) {
        //                        ElectricWaterRecord record = recordOpt.get();
        //                        int usage = "Điện".equals(amen.getName())
        //                                ? (record.getElectricEnd() - record.getElectricStart())
        //                                : (record.getWaterEnd() - record.getWaterStart());
        //                        price = BigDecimal.valueOf(Math.max(0, usage)).multiply(amen.getUnitPrice());
        //                    } else {
        //                        price = BigDecimal.ZERO;
        //                    }
        //                } else {
        //                    price = (ra.getUsageAmount() != null ? ra.getUsageAmount() : BigDecimal.ZERO)
        //                            .multiply(amen.getUnitPrice());
        //                }
        //            } else {
        //                // FIXED/PER_PERSON/etc: unit_price * quantity
        //                price = amen.getUnitPrice().multiply(BigDecimal.valueOf(ra.getQuantity()));
        //            }
        //            total = total.add(price);
        //        }

        return total;
    }

    private ContractStatus resolveStatusForToday(Contract contract, LocalDate today) {
        if (contract.getStatus() == ContractStatus.CANCELLED) {
            return ContractStatus.CANCELLED;
        }

        if (contract.getStartDate() != null) {
            LocalDate startDate = contract.getStartDate();
            if (startDate.isAfter(today)) {
                return ContractStatus.PENDING;
            }
        }

        if (contract.getEndDate() != null) {
            LocalDate endDate = contract.getEndDate();
            if (endDate.isBefore(today)) {
                return ContractStatus.EXPIRED;
            }
        }

        return ContractStatus.ACTIVE;
    }

    private void syncRoomOccupancyStatus(Room room, LocalDate today) {
        if (Boolean.TRUE.equals(room.getIsDeleted())) {
            return;
        }

        boolean hasEffectiveActiveContract =
                contractRepository.existsEffectiveActiveContractByRoomId(room.getId(), today);

        if (hasEffectiveActiveContract && room.getStatus() == RoomStatus.AVAILABLE) {
            room.setStatus(RoomStatus.OCCUPIED);
            roomRepository.save(room);
            return;
        }

        if (!hasEffectiveActiveContract && room.getStatus() == RoomStatus.OCCUPIED) {
            room.setStatus(RoomStatus.AVAILABLE);
            roomRepository.save(room);
        }
    }

    public static class RunnableJob implements Job {
        @Override
        public void execute(JobExecutionContext context) throws JobExecutionException {
            // Generic execute - pull task from data if needed
            log.info("Executing generic job: {}", context.getJobDetail().getKey());
        }
    }
}
