package carevn.luv2code.ez_tro.controller.admin;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.service.admin.CronJobService;
import carevn.luv2code.ez_tro.service.admin.impl.CronJobServiceImpl;
import lombok.RequiredArgsConstructor;

/**
 * REST Controller quản lý các cron job/quartz job và các tác vụ chạy định kỳ.
 *
 * <p>Nhóm endpoint:
 * <ul>
 *   <li>CRUD job theo {@link CronJobService} (schedule/update/delete/list/details).</li>
 *   <li>Manual trigger cho một số batch job (generate bills, sync contract status, auto renew).</li>
 * </ul>
 *
 * <p>Lưu ý: một số manual endpoint đang gọi trực tiếp method nội bộ của {@link CronJobServiceImpl}
 * thông qua cast để dùng lại logic sẵn có.
 */
@RestController
@RequestMapping("/api/cron-jobs")
@RequiredArgsConstructor
public class CronJobController {
    private final CronJobService cronJobService;

    /**
     * Schedule một job theo cron expression.
     *
     * @param jobId id job
     * @param cronExpression cron expression (Quartz)
     * @return response 200 nếu schedule thành công
     */
    @PostMapping
    public ResponseEntity<Void> scheduleJob(@RequestParam String jobId, @RequestParam String cronExpression) {
        cronJobService.scheduleJob(jobId, cronExpression, () -> System.out.println("Executing job: " + jobId));
        return ResponseEntity.ok().build();
    }

    /**
     * Cập nhật cron expression của một job.
     *
     * @param jobId id job
     * @param cronExpression cron expression (Quartz)
     * @return response 200 nếu update thành công
     */
    @PutMapping("/{jobId}")
    public ResponseEntity<Void> updateJob(@PathVariable String jobId, @RequestParam String cronExpression) {
        cronJobService.updateJob(jobId, cronExpression);
        return ResponseEntity.ok().build();
    }

    /**
     * Xóa một job đã được schedule.
     *
     * @param jobId id job
     * @return response 200 nếu xóa thành công
     */
    @DeleteMapping("/{jobId}")
    public ResponseEntity<Void> deleteJob(@PathVariable String jobId) {
        cronJobService.deleteJob(jobId);
        return ResponseEntity.ok().build();
    }

    /**
     * Liệt kê các job đã được schedule.
     *
     * @return danh sách job id
     */
    @GetMapping
    public ResponseEntity<List<String>> listJobs() {
        return ResponseEntity.ok(cronJobService.listScheduledJobs());
    }

    /**
     * Kiểm tra một job có đang được schedule hay không.
     *
     * @param jobId id job
     * @return true nếu đã schedule
     */
    @GetMapping("/{jobId}")
    public ResponseEntity<Boolean> isJobScheduled(@PathVariable String jobId) {
        return ResponseEntity.ok(cronJobService.isJobScheduled(jobId));
    }

    /**
     * Lấy thông tin chi tiết của một job (định dạng string theo Quartz).
     *
     * @param jobId id job
     * @return thông tin job
     */
    @GetMapping("/{jobId}/details")
    public ResponseEntity<String> getJobDetails(@PathVariable String jobId) {
        return ResponseEntity.ok(cronJobService.getJobDetails(jobId));
    }

    /**
     * Trigger manual: tạo hóa đơn tháng hiện tại.
     *
     * @return kết quả chạy batch (message)
     */
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

    /**
     * Trigger manual: sync trạng thái hợp đồng theo ngày hiện tại.
     *
     * @return số contract đã update
     */
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

    /**
     * Trigger manual: chạy auto-renew hợp đồng (nếu bật autoRenew).
     *
     * @return số contract đã renew
     */
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
