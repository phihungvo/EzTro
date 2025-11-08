package carevn.luv2code.ez_tro.entity;

import java.math.BigDecimal;
import java.util.Date;

import carevn.luv2code.ez_tro.enums.BillStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "bills")
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    Integer id;

    String billTitle;

    @Column(length = 50, unique = true)
    String billCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    @ToString.Exclude
    Contract contract;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = true)
    Tenant tenant;

    @Column(name = "amount", nullable = false)
    BigDecimal amount;

    @Temporal(TemporalType.DATE)
    @Column(name = "payment_date")
    Date paymentDate;

    @NotNull
    @Column(nullable = false)
    Date dueDate;

    @Min(value = 0)
    @Column(precision = 10, scale = 2, nullable = false)
    BigDecimal serviceAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    BillStatus status = BillStatus.UNPAID;

    @Column(length = 500)
    String note;

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
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }
}
