package carevn.luv2code.ez_tro.job;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import carevn.luv2code.ez_tro.service.admin.BillingOrchestratorService;
import carevn.luv2code.ez_tro.service.admin.ClusterJobLockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class MonthlyRentBillingJob {
    private static final String BILLING_CLUSTER_LOCK_KEY = "billing-monthly";

    private final BillingOrchestratorService billingOrchestratorService;
    private final ClusterJobLockService clusterJobLockService;

    @Value("${app.jobs.billing.cluster-lock.ttl-seconds:1800}")
    private long billingClusterLockTtlSeconds;

    @Scheduled(cron = "${app.jobs.billing.orchestrator.cron:0 0 1 * * ?}")
    public void generateRentBills() {
        boolean executed = clusterJobLockService.executeWithLock(
                BILLING_CLUSTER_LOCK_KEY,
                java.time.Duration.ofSeconds(Math.max(60, billingClusterLockTtlSeconds)),
                () -> {
                    LocalDate today = LocalDate.now();
                    int invoices = billingOrchestratorService.generateInvoices(today);
                    int penalties = billingOrchestratorService.applyLatePenalties(today);
                    log.info(
                            "Billing orchestrator job completed. Generated/updated invoices={}, applied penalties={}",
                            invoices,
                            penalties);
                });
        if (!executed) {
            log.info("Skip billing orchestrator job because billing cluster lock is held by another instance.");
        }
    }
}
