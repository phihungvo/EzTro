package carevn.luv2code.ez_tro.entity;

import java.time.LocalDateTime;

import carevn.luv2code.ez_tro.enums.NotificationCategory;
import carevn.luv2code.ez_tro.enums.NotificationChannel;
import carevn.luv2code.ez_tro.enums.NotificationDeliveryStatus;
import carevn.luv2code.ez_tro.enums.NotificationPriority;
import carevn.luv2code.ez_tro.enums.NotificationReadStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    NotificationEvent event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id")
    User recipient;

    @Column(name = "sender_id")
    Integer senderId;

    @Column(nullable = false, length = 255)
    String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    String message;

    @Column(nullable = false, length = 50)
    String type; // PERSONAL, BILL_REMINDER, CONTRACT, SYSTEM, INCIDENT...

    @Column(name = "event_key", length = 100)
    String eventKey;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    NotificationCategory category;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    NotificationPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    NotificationChannel channel = NotificationChannel.IN_APP;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_status", length = 20)
    NotificationDeliveryStatus deliveryStatus = NotificationDeliveryStatus.DELIVERED;

    @Enumerated(EnumType.STRING)
    @Column(name = "read_status", length = 20)
    NotificationReadStatus readStatus = NotificationReadStatus.UNREAD;

    @Column(name = "action_url", length = 500)
    String actionUrl;

    @Column(name = "action_label", length = 100)
    String actionLabel;

    @Column(name = "metadata_json", columnDefinition = "LONGTEXT")
    String metadataJson;

    @Column(name = "recipient_role", length = 50)
    String recipientRole;

    @Column(columnDefinition = "JSON")
    String data; // JSON string

    @Column(name = "is_broadcast", nullable = false)
    Boolean isBroadcast = false;

    @Column(name = "is_read")
    Boolean isRead = false;

    @Column(name = "read_at")
    LocalDateTime readAt;

    @Column(name = "archived_at")
    LocalDateTime archivedAt;

    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt = LocalDateTime.now();
}
