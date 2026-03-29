package carevn.luv2code.ez_tro.service.admin;

import java.time.Duration;

public interface ClusterJobLockService {
    boolean executeWithLock(String jobKey, Duration leaseDuration, Runnable task);
}
