package carevn.luv2code.ez_tro.entity;

import java.time.LocalDateTime;

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
    @JoinColumn(name = "recipient_id")
    private User recipient;

    @Column(name = "sender_id")
    Integer senderId;

    @Column(nullable = false, length = 255)
    String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    String message;

    @Column(nullable = false, length = 50)
    String type; // PERSONAL, BILL_REMINDER, CONTRACT, SYSTEM, INCIDENT...

    @Column(columnDefinition = "JSON")
    String data; // JSON string

    @Column(name = "is_broadcast", nullable = false)
    Boolean isBroadcast = false;

    @Column(name = "is_read")
    Boolean isRead = false;

    @Column(name = "read_at")
    LocalDateTime readAt;

    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt = LocalDateTime.now();
}
