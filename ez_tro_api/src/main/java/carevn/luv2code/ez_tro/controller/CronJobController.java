package carevn.luv2code.ez_tro.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.service.CronJobService;
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
}
