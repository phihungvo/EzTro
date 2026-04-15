package carevn.luv2code.ez_tro.entity;

import java.math.BigDecimal;
import java.util.Date;

import carevn.luv2code.ez_tro.enums.DepositReferenceType;
import carevn.luv2code.ez_tro.enums.DepositTransactionType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "deposit_transactions")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DepositTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    @ToString.Exclude
    Contract contract;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 40)
    DepositTransactionType transactionType;

    @Column(nullable = false, precision = 12, scale = 2)
    BigDecimal amount;

    @Column(nullable = false, length = 3)
    String currency = "VND";

    @Enumerated(EnumType.STRING)
    @Column(name = "reference_type", length = 40)
    DepositReferenceType referenceType;

    @Column(name = "reference_id", length = 100)
    String referenceId;

    @Column(columnDefinition = "TEXT")
    String note;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "occurred_at", nullable = false)
    Date occurredAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    User createdBy;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", updatable = false)
    Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "updated_at")
    Date updatedAt;

    @PrePersist
    protected void onCreate() {
        Date now = new Date();
        if (occurredAt == null) {
            occurredAt = now;
        }
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }
}
