package carevn.luv2code.ez_tro.entity;

import java.util.Date;

import carevn.luv2code.ez_tro.enums.BillingAuditTargetType;
import carevn.luv2code.ez_tro.enums.BillingOperationType;
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
        name = "billing_operation_logs",
        indexes = {
            @Index(name = "idx_billing_operation_logs_contract", columnList = "contract_id"),
            @Index(name = "idx_billing_operation_logs_target", columnList = "target_type,target_id")
        })
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BillingOperationLog {

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
    @Column(name = "target_type", nullable = false, length = 20)
    BillingAuditTargetType targetType;

    @Column(name = "target_id", nullable = false)
    Integer targetId;

    @Enumerated(EnumType.STRING)
    @Column(name = "operation_type", nullable = false, length = 40)
    BillingOperationType operationType;

    @Column(name = "request_id", length = 120)
    String requestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    User actor;

    @Column(name = "before_state_json", columnDefinition = "LONGTEXT")
    String beforeStateJson;

    @Column(name = "after_state_json", columnDefinition = "LONGTEXT")
    String afterStateJson;

    @Column(name = "metadata_json", columnDefinition = "LONGTEXT")
    String metadataJson;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", nullable = false)
    Date createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = new Date();
        }
    }
}
