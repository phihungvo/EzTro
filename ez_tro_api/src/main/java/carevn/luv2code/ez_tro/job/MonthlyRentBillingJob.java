package carevn.luv2code.ez_tro.job;

import java.time.LocalDate;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import carevn.luv2code.ez_tro.service.admin.BillingOrchestratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class MonthlyRentBillingJob {

    private final BillingOrchestratorService billingOrchestratorService;

    @Scheduled(cron = "${app.jobs.billing.orchestrator.cron:0 0 1 * * ?}")
    public void generateRentBills() {
        LocalDate today = LocalDate.now();
        int invoices = billingOrchestratorService.generateInvoices(today);
        int penalties = billingOrchestratorService.applyLatePenalties(today);
        log.info(
                "Billing orchestrator job completed. Generated/updated invoices={}, applied penalties={}",
                invoices,
                penalties);
    }
}
