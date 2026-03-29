package carevn.luv2code.ez_tro.service.admin.impl;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.entity.ScheduledJobLock;
import carevn.luv2code.ez_tro.repository.ScheduledJobLockRepository;
import carevn.luv2code.ez_tro.service.admin.ClusterJobLockService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClusterJobLockServiceImpl implements ClusterJobLockService {

    private final ScheduledJobLockRepository scheduledJobLockRepository;

    @Value("${app.jobs.cluster-lock.instance-id:}")
    private String configuredInstanceId;

    private String instanceId;

    @PostConstruct
    void initInstanceId() {
        instanceId = configuredInstanceId != null && !configuredInstanceId.isBlank()
                ? configuredInstanceId
                : "instance-" + UUID.randomUUID();
    }

    @Override
    public boolean executeWithLock(String jobKey, Duration leaseDuration, Runnable task) {
        if (!tryAcquire(jobKey, leaseDuration)) {
            return false;
        }

        try {
            task.run();
            return true;
        } finally {
            release(jobKey);
        }
    }

    @Transactional
    protected boolean tryAcquire(String jobKey, Duration leaseDuration) {
        LocalDateTime now = LocalDateTime.now();
        ScheduledJobLock lock =
                scheduledJobLockRepository.findByJobKeyForUpdate(jobKey).orElse(null);
        if (lock == null) {
            ScheduledJobLock newLock = ScheduledJobLock.builder()
                    .jobKey(jobKey)
                    .lockedBy(instanceId)
                    .lockedUntil(now.plus(leaseDuration))
                    .lastStartedAt(now)
                    .updatedAt(now)
                    .build();
            try {
                scheduledJobLockRepository.saveAndFlush(newLock);
                return true;
            } catch (DataIntegrityViolationException ex) {
                lock = scheduledJobLockRepository.findByJobKeyForUpdate(jobKey).orElse(null);
            }
        }

        if (lock == null) {
            return false;
        }

        if (lock.getLockedUntil() != null
                && lock.getLockedUntil().isAfter(now)
                && !instanceId.equals(lock.getLockedBy())) {
            log.info(
                    "Skip job {} because lock is held by {} until {}",
                    jobKey,
                    lock.getLockedBy(),
                    lock.getLockedUntil());
            return false;
        }

        lock.setLockedBy(instanceId);
        lock.setLockedUntil(now.plus(leaseDuration));
        lock.setLastStartedAt(now);
        scheduledJobLockRepository.save(lock);
        return true;
    }

    @Transactional
    protected void release(String jobKey) {
        scheduledJobLockRepository.findByJobKeyForUpdate(jobKey).ifPresent(lock -> {
            LocalDateTime now = LocalDateTime.now();
            if (lock.getLockedBy() == null || instanceId.equals(lock.getLockedBy())) {
                lock.setLockedUntil(now);
                lock.setLastFinishedAt(now);
                scheduledJobLockRepository.save(lock);
            }
        });
    }
}
