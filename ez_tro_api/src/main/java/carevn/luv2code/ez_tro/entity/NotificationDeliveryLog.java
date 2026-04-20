package carevn.luv2code.ez_tro.entity;

import java.time.LocalDateTime;

import carevn.luv2code.ez_tro.enums.NotificationChannel;
import carevn.luv2code.ez_tro.enums.NotificationDeliveryStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(
        name = "notification_delivery_logs",
        uniqueConstraints = {
            @UniqueConstraint(
                    name = "uk_notification_delivery_logs_event_recipient_channel",
                    columnNames = {"event_id", "recipient_id", "channel"})
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationDeliveryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    NotificationEvent event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    User recipient;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    NotificationChannel channel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    NotificationDeliveryStatus status;

    @Column(length = 100)
    String provider;

    @Column(length = 255)
    String destination;

    @Column(nullable = false, length = 255)
    String title;

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    String message;

    @Column(name = "payload_json", columnDefinition = "LONGTEXT")
    String payloadJson;

    @Column(name = "attempt_count", nullable = false)
    Integer attemptCount = 0;

    @Column(name = "max_attempts", nullable = false)
    Integer maxAttempts = 3;

    @Column(name = "last_attempt_at")
    LocalDateTime lastAttemptAt;

    @Column(name = "next_retry_at")
    LocalDateTime nextRetryAt;

    @Column(name = "provider_message_id", length = 255)
    String providerMessageId;

    @Column(name = "last_error", columnDefinition = "LONGTEXT")
    String lastError;

    @Column(name = "last_response_json", columnDefinition = "LONGTEXT")
    String lastResponseJson;

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
