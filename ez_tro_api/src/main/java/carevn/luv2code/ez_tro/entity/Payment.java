package carevn.luv2code.ez_tro.entity;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

import carevn.luv2code.ez_tro.enums.PaymentStatus;
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
@Table(
        name = "payments",
        uniqueConstraints =
                @UniqueConstraint(
                        name = "uk_payments_external_reference",
                        columnNames = {"external_reference"}))
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Payment {

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    Tenant tenant;

    @Column(precision = 14, scale = 2, nullable = false)
    BigDecimal amount;

    @Column(length = 10, nullable = false)
    String currency = "VND";

    @Column(name = "external_reference", length = 120, nullable = false)
    String externalReference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    PaymentStatus status = PaymentStatus.PENDING;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "received_at")
    Date receivedAt;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "confirmed_at")
    Date confirmedAt;

    @Column(columnDefinition = "TEXT")
    String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    User createdBy;

    @OneToMany(mappedBy = "payment", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    List<PaymentAllocation> allocations;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", updatable = false)
    Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "updated_at")
    Date updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        updatedAt = new Date();
        if (receivedAt == null) {
            receivedAt = new Date();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }
}
