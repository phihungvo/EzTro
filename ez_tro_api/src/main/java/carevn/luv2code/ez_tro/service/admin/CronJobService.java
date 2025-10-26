package carevn.luv2code.ez_tro.service.admin;

import java.util.List;

public interface CronJobService {
    void scheduleJob(String jobId, String cronExpression, Runnable task);

    void updateJob(String jobId, String cronExpression);

    void deleteJob(String jobId);

    List<String> listScheduledJobs();

    boolean isJobScheduled(String jobId);

    String getJobDetails(String jobId);

    void scheduleBillGenerationJob(String cronExpression);
}
