package carevn.luv2code.ez_tro.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import carevn.luv2code.ez_tro.entity.ScheduledJobLock;
import jakarta.persistence.LockModeType;

public interface ScheduledJobLockRepository extends JpaRepository<ScheduledJobLock, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT l FROM ScheduledJobLock l WHERE l.jobKey = :jobKey")
    Optional<ScheduledJobLock> findByJobKeyForUpdate(@Param("jobKey") String jobKey);
}
