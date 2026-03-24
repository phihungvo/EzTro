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

import carevn.luv2code.ez_tro.dto.response.ContractSnapshotResponse;
import carevn.luv2code.ez_tro.entity.*;
import carevn.luv2code.ez_tro.enums.BillStatus;
import carevn.luv2code.ez_tro.enums.ContractStatus;
import carevn.luv2code.ez_tro.enums.RoomStatus;
import carevn.luv2code.ez_tro.repository.*;
import carevn.luv2code.ez_tro.service.admin.ContractService;
import carevn.luv2code.ez_tro.service.admin.ContractSnapshotService;
import carevn.luv2code.ez_tro.service.admin.CronJobService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

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

    @Autowired
    private Scheduler scheduler;

    @Value("${app.jobs.contract-status-sync.batch-size:100}")
    private int contractStatusSyncBatchSize;

    public CronJobServiceImpl(
            ContractRepository contractRepository,
            RoomRepository roomRepository,
            //            AmenityRepository amenityRepository,
            //            RoomAmenityRepository roomAmenityRepository,
            //            ElectricWaterRecordRepository electricWaterRecordRepository,
            BillRepository billRepository,
            ContractSnapshotService contractSnapshotService,
            ContractService contractService)
            throws SchedulerException {
        this.contractRepository = contractRepository;
        this.roomRepository = roomRepository;
        //        this.amenityRepository = amenityRepository;
        //        this.roomAmenityRepository = roomAmenityRepository;
        //        this.electricWaterRecordRepository = electricWaterRecordRepository;
        this.billRepository = billRepository;
        this.contractSnapshotService = contractSnapshotService;
        this.contractService = contractService;
        scheduler = StdSchedulerFactory.getDefaultScheduler();
        scheduler.start();
    }

    @PostConstruct
    public void initDefaultBillJob() {
        scheduleBillGenerationJob("0 * * * * ?"); // Mỗi phút (giây 0)
        log.info("Auto-scheduled bill generation job every minute for testing");
    }

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

    @Override
    public void deleteJob(String jobId) {
        try {
            scheduler.deleteJob(new JobKey(jobId));
        } catch (SchedulerException e) {
            throw new RuntimeException("Failed to delete job: " + jobId, e);
        }
    }

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

    @Override
    public boolean isJobScheduled(String jobId) {
        try {
            return scheduler.checkExists(new JobKey(jobId));
        } catch (SchedulerException e) {
            throw new RuntimeException("Failed to check if job is scheduled: " + jobId, e);
        }
    }

    @Override
    public String getJobDetails(String jobId) {
        try {
            JobDetail jobDetail = scheduler.getJobDetail(new JobKey(jobId));
            return jobDetail != null ? jobDetail.toString() : "Job not found";
        } catch (SchedulerException e) {
            throw new RuntimeException("Failed to get job details: " + jobId, e);
        }
    }

    @Override
    @Transactional
    public void scheduleBillGenerationJob(String cronExpression) {
        Runnable billTask = this::generateMonthlyBills;
        String jobId = "bill-generation";
        scheduleJob(jobId, cronExpression, billTask);
        log.info("Scheduled bill generation job with cron: {}", cronExpression);
    }

    @Scheduled(cron = "${app.jobs.contract-status-sync.cron:0 10 0 * * *}")
    public void runDailyContractStatusSync() {
        int updated = syncContractStatusesDaily();
        log.info("Daily contract status sync completed. Updated {} contract(s).", updated);
    }

    @Scheduled(cron = "${app.jobs.contract-auto-renew.cron:0 20 0 * * *}")
    public void scheduledContractAutoRenewal() {
        int renewed = runDailyContractAutoRenewal();
        log.info("Daily contract auto-renew completed. Renewed {} contract(s).", renewed);
    }

    @Transactional
    public int runDailyContractAutoRenewal() {
        return contractService.processAutoRenewals(LocalDate.now());
    }

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

    // Business logic: Generate bills for current month
    public void generateMonthlyBills() {
        LocalDate now = LocalDate.now(); // 2025-10-26
        int currentMonth = now.getMonthValue();
        int currentYear = now.getYear();
        LocalDate dueDateLocal = now.withDayOfMonth(now.lengthOfMonth()); // 2025-10-31

        // 1. Lấy active contracts
        List<Contract> activeContracts = contractRepository.findActiveContractsForBilling(currentMonth, currentYear);

        for (Contract contract : activeContracts) {
            try {
                // Skip nếu đã có bill tháng này
                //                Optional<Bill> existingBill =
                //                        billRepository.findByContractAndMonthYear(contract, currentMonth,
                // currentYear);
                //                if (existingBill.isPresent()) continue;

                // 2. Validate room & tenant
                Room room = contract.getRoom();
                if (!room.getStatus().equals(RoomStatus.OCCUPIED) || Boolean.TRUE.equals(room.getIsDeleted())) {
                    log.warn("Skipping bill for contract {}: Room not occupied", contract.getId());
                    continue;
                }
                Tenant tenant = contract.getTenant();
                if (tenant == null || !tenant.getUser().isEnabled()) continue;

                // 3. Tính amount
                ContractSnapshotResponse snapshot = contractSnapshotService.getSnapshot(contract.getId(), dueDateLocal);
                BigDecimal rent = snapshot.getCurrentVersion() != null
                                && snapshot.getCurrentVersion().getPrice() != null
                        ? snapshot.getCurrentVersion().getPrice()
                        : contract.getRentPrice();
                BigDecimal services = calculateServiceAmount(room, currentMonth, currentYear);

                BigDecimal totalAmount = rent.add(services);
                String billCode = "BILL-" + contract.getContractCode() + "-"
                        + String.format("%02d%04d", currentMonth, currentYear);

                // 4. Tạo bill
                Bill bill = Bill.builder()
                        .contract(contract)
                        .room(room)
                        .tenant(tenant)
                        .billTitle(String.format("Hóa đơn tháng %02d/%d", currentMonth, currentYear))
                        .billCode(billCode)
                        .amount(totalAmount)
                        .serviceAmount(services)
                        .dueDate(dueDateLocal)
                        .status(BillStatus.UNPAID)
                        .note(String.format("Rent: %s, Services: %s", rent, services))
                        .build();

                Bill savedBill = billRepository.save(bill);
                log.info("Generated bill {} for contract {}", savedBill.getId(), contract.getId());

            } catch (Exception e) {
                log.error("Error generating bill for contract {}: {}", contract.getId(), e.getMessage(), e);
            }
        }
        log.info("Monthly bill generation completed for {}/{}", currentMonth, currentYear);
    }

    // Helper: Tính service amount từ amenities & utilities
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
