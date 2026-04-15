package carevn.luv2code.ez_tro.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;

import carevn.luv2code.ez_tro.enums.ContractStatus;
import carevn.luv2code.ez_tro.enums.PaymentMethod;
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
@Table(name = "contracts")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    Integer id;

    @Column(name = "contract_code", unique = true, nullable = false, length = 30)
    String contractCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    @ToString.Exclude
    Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    @ToString.Exclude
    Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    @ToString.Exclude
    Organization organization;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    List<Bill> bills;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    List<File> files;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    List<ContractVersion> versions;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    List<ContractAmendment> amendments;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    List<ContractBillingRule> billingRules;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    List<DepositTransaction> depositTransactions;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    List<ContractStateTransition> stateTransitions;

    //    @Temporal(TemporalType.DATE)
    //    @Column(name = "start_date", nullable = false)
    //    Date startDate;
    //
    //    @Temporal(TemporalType.DATE)
    //    @Column(name = "end_date")
    //    Date endDate;

    @Column(name = "start_date", nullable = false)
    LocalDate startDate;

    @Column(name = "end_date")
    LocalDate endDate;

    @Column(name = "auto_renew", nullable = false)
    Boolean autoRenew = false;

    @Column(precision = 12, scale = 2)
    BigDecimal deposit;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "deposit_received_at")
    Date depositReceivedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "deposit_payment_method")
    PaymentMethod depositPaymentMethod;

    @Column(name = "payment_cycle_months")
    Integer paymentCycleMonths;

    @Column(name = "monthly_payment_day")
    Integer monthlyPaymentDay;

    @Column(name = "rent_price", precision = 12, scale = 2, nullable = false)
    BigDecimal rentPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    ContractStatus status = ContractStatus.ACTIVE;

    @Column(columnDefinition = "TEXT")
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
