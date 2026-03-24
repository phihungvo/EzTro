package carevn.luv2code.ez_tro.entity;

import java.util.Date;

import carevn.luv2code.ez_tro.enums.ContractLifecycleState;
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
@Table(name = "contract_state_transitions")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContractStateTransition {

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
    @Column(name = "from_state", length = 30)
    ContractLifecycleState fromState;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_state", nullable = false, length = 30)
    ContractLifecycleState toState;

    @Column(length = 255)
    String reason;

    @Column(name = "metadata_json", columnDefinition = "LONGTEXT")
    String metadataJson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by")
    User changedBy;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "changed_at", nullable = false)
    Date changedAt;

    @PrePersist
    protected void onCreate() {
        if (changedAt == null) {
            changedAt = new Date();
        }
    }
}
