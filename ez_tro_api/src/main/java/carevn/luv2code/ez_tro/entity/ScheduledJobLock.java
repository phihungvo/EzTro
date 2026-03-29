package carevn.luv2code.ez_tro.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "scheduled_job_locks")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ScheduledJobLock {

    @Id
    @Column(name = "job_key", nullable = false, length = 120)
    String jobKey;

    @Column(name = "locked_until", nullable = false)
    LocalDateTime lockedUntil;

    @Column(name = "locked_by", length = 120)
    String lockedBy;

    @Column(name = "last_started_at")
    LocalDateTime lastStartedAt;

    @Column(name = "last_finished_at")
    LocalDateTime lastFinishedAt;

    @Column(name = "updated_at", nullable = false)
    LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
