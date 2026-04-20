package carevn.luv2code.ez_tro.entity;

import java.time.LocalDateTime;

import carevn.luv2code.ez_tro.enums.NotificationCategory;
import carevn.luv2code.ez_tro.enums.NotificationPriority;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "notification_events")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "event_key", nullable = false, length = 100)
    String eventKey;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    NotificationCategory category;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    NotificationPriority priority;

    @Column(name = "source_module", length = 50)
    String sourceModule;

    @Column(name = "entity_type", length = 50)
    String entityType;

    @Column(name = "entity_id", length = 50)
    String entityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_user_id")
    User actorUser;

    @Column(name = "payload_json", columnDefinition = "LONGTEXT")
    String payloadJson;

    @Column(name = "dedupe_key", length = 255)
    String dedupeKey;

    @Column(length = 255)
    String title;

    @Column(columnDefinition = "LONGTEXT")
    String message;

    @Column(name = "occurred_at", nullable = false)
    LocalDateTime occurredAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (occurredAt == null) {
            occurredAt = now;
        }
        if (createdAt == null) {
            createdAt = now;
        }
    }
}
