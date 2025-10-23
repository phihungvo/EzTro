package carevn.luv2code.ez_tro.service.admin.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.quartz.*;
import org.quartz.impl.StdSchedulerFactory;
import org.quartz.impl.matchers.GroupMatcher;
import org.springframework.stereotype.Service;

import carevn.luv2code.ez_tro.service.admin.CronJobService;

@Service
public class CronJobServiceImpl implements CronJobService {
    private final Scheduler scheduler;

    public CronJobServiceImpl() throws SchedulerException {
        this.scheduler = StdSchedulerFactory.getDefaultScheduler();
        this.scheduler.start();
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

    public static class RunnableJob implements Job {
        @Override
        public void execute(JobExecutionContext context) {
            // Execute the task
        }
    }
}
