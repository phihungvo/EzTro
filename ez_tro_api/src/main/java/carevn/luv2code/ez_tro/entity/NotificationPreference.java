package carevn.luv2code.ez_tro.entity;

import java.time.LocalDateTime;

import carevn.luv2code.ez_tro.enums.NotificationChannel;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(
        name = "notification_preferences",
        uniqueConstraints = {
            @UniqueConstraint(
                    name = "uk_notification_preferences_user_event_channel",
                    columnNames = {"user_id", "event_key", "channel"})
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @Column(name = "event_key", nullable = false, length = 100)
    String eventKey;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    NotificationChannel channel;

    @Column(nullable = false)
    Boolean enabled = true;

    @Column(name = "is_mandatory", nullable = false)
    Boolean mandatory = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
