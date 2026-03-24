package carevn.luv2code.ez_tro.controller.admin;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.service.admin.CronJobService;
import carevn.luv2code.ez_tro.service.admin.impl.CronJobServiceImpl;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cron-jobs")
@RequiredArgsConstructor
public class CronJobController {
    private final CronJobService cronJobService;

    @PostMapping
    public ResponseEntity<Void> scheduleJob(@RequestParam String jobId, @RequestParam String cronExpression) {
        cronJobService.scheduleJob(jobId, cronExpression, () -> System.out.println("Executing job: " + jobId));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{jobId}")
    public ResponseEntity<Void> updateJob(@PathVariable String jobId, @RequestParam String cronExpression) {
        cronJobService.updateJob(jobId, cronExpression);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{jobId}")
    public ResponseEntity<Void> deleteJob(@PathVariable String jobId) {
        cronJobService.deleteJob(jobId);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<String>> listJobs() {
        return ResponseEntity.ok(cronJobService.listScheduledJobs());
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<Boolean> isJobScheduled(@PathVariable String jobId) {
        return ResponseEntity.ok(cronJobService.isJobScheduled(jobId));
    }

    @GetMapping("/{jobId}/details")
    public ResponseEntity<String> getJobDetails(@PathVariable String jobId) {
        return ResponseEntity.ok(cronJobService.getJobDetails(jobId));
    }

    @PostMapping("/generate-bills/manual")
    public ApiResponse<String> manualGenerateBills() {
        try {
            ((CronJobServiceImpl) cronJobService).generateMonthlyBills();
            return ApiResponse.<String>builder()
                    .code(HttpStatus.OK.value())
                    .message("Manual bill generation completed for current month")
                    .result("Bills generated successfully")
                    .build();
        } catch (Exception e) {
            return ApiResponse.<String>builder()
                    .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Failed to generate bills: " + e.getMessage())
                    .build();
        }
    }

    @PostMapping("/contracts/sync-status/manual")
    public ApiResponse<String> manualSyncContractStatuses() {
        try {
            int updated = cronJobService.syncContractStatusesDaily();
            return ApiResponse.<String>builder()
                    .code(HttpStatus.OK.value())
                    .message("Manual contract status sync completed successfully")
                    .result("Updated contracts: " + updated)
                    .build();
        } catch (Exception e) {
            return ApiResponse.<String>builder()
                    .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Failed to sync contract statuses: " + e.getMessage())
                    .build();
        }
    }

    @PostMapping("/contracts/auto-renew/manual")
    public ApiResponse<String> manualRunAutoRenew() {
        try {
            int renewed = ((CronJobServiceImpl) cronJobService).runDailyContractAutoRenewal();
            return ApiResponse.<String>builder()
                    .code(HttpStatus.OK.value())
                    .message("Manual contract auto-renew completed successfully")
                    .result("Renewed contracts: " + renewed)
                    .build();
        } catch (Exception e) {
            return ApiResponse.<String>builder()
                    .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Failed to auto-renew contracts: " + e.getMessage())
                    .build();
        }
    }
}
