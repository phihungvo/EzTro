package carevn.luv2code.ez_tro.entity;

import java.util.Date;

import carevn.luv2code.ez_tro.enums.PaymentOperationStatus;
import carevn.luv2code.ez_tro.enums.PaymentOperationType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "payment_operation_logs",
        uniqueConstraints =
                @UniqueConstraint(
                        name = "uk_payment_operation_logs_idempotency",
                        columnNames = {"target_key", "operation_type", "idempotency_key"}))
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentOperationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    Contract contract;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    Payment payment;

    @Column(name = "target_key", nullable = false, length = 120)
    String targetKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "operation_type", nullable = false, length = 30)
    PaymentOperationType operationType;

    @Column(name = "idempotency_key", nullable = false, length = 120)
    String idempotencyKey;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    PaymentOperationStatus status;

    @Column(name = "request_id", length = 120)
    String requestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    User actor;

    @Column(name = "result_json", columnDefinition = "LONGTEXT")
    String resultJson;

    @Column(name = "metadata_json", columnDefinition = "LONGTEXT")
    String metadataJson;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", nullable = false)
    Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "completed_at")
    Date completedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = new Date();
        }
    }
}
