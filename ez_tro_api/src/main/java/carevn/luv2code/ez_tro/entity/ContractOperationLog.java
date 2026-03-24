package carevn.luv2code.ez_tro.entity;

import java.util.Date;

import carevn.luv2code.ez_tro.enums.ContractOperationStatus;
import carevn.luv2code.ez_tro.enums.ContractOperationType;
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
        name = "contract_operation_logs",
        uniqueConstraints =
                @UniqueConstraint(
                        name = "uk_contract_operation_logs_idempotency",
                        columnNames = {"contract_id", "operation_type", "idempotency_key"}))
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContractOperationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    Contract contract;

    @Enumerated(EnumType.STRING)
    @Column(name = "operation_type", nullable = false, length = 50)
    ContractOperationType operationType;

    @Column(name = "idempotency_key", nullable = false, length = 120)
    String idempotencyKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    ContractOperationStatus status;

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
