package carevn.luv2code.ez_tro.job;

import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import carevn.luv2code.ez_tro.service.admin.BillingOrchestratorService;
import carevn.luv2code.ez_tro.service.admin.ClusterJobLockService;

@ExtendWith(MockitoExtension.class)
class MonthlyRentBillingJobTest {

    @Mock
    private BillingOrchestratorService billingOrchestratorService;

    @Mock
    private ClusterJobLockService clusterJobLockService;

    @InjectMocks
    private MonthlyRentBillingJob monthlyRentBillingJob;

    @Test
    void generateRentBills_shouldSkipWhenClusterLockNotAcquired() {
        ReflectionTestUtils.setField(monthlyRentBillingJob, "billingClusterLockTtlSeconds", 1800L);
        when(clusterJobLockService.executeWithLock(anyString(), any(), any())).thenReturn(false);

        monthlyRentBillingJob.generateRentBills();

        verify(clusterJobLockService).executeWithLock(anyString(), any(), any());
        verifyNoInteractions(billingOrchestratorService);
    }

    @Test
    void generateRentBills_shouldRunBillingWhenClusterLockAcquired() {
        ReflectionTestUtils.setField(monthlyRentBillingJob, "billingClusterLockTtlSeconds", 1800L);
        when(clusterJobLockService.executeWithLock(anyString(), any(), any())).thenAnswer(invocation -> {
            Runnable task = invocation.getArgument(2);
            task.run();
            return true;
        });
        when(billingOrchestratorService.generateInvoices(any())).thenReturn(5);
        when(billingOrchestratorService.applyLatePenalties(any())).thenReturn(2);

        monthlyRentBillingJob.generateRentBills();

        verify(clusterJobLockService).executeWithLock(anyString(), any(), any());
        verify(billingOrchestratorService).generateInvoices(any());
        verify(billingOrchestratorService).applyLatePenalties(any());
    }
}
