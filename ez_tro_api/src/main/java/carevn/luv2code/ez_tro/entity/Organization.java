package carevn.luv2code.ez_tro.entity;

import java.util.Date;
import java.util.List;

import carevn.luv2code.ez_tro.enums.OrganizationStatus;
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
@Table(name = "organizations")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    Integer id;

    @Column(name = "organization_code", nullable = false, unique = true, length = 50)
    @ToString.Include
    String organizationCode;

    @Column(nullable = false, length = 150)
    String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    @ToString.Exclude
    User owner;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    OrganizationStatus status = OrganizationStatus.ACTIVE;

    @Column(columnDefinition = "TEXT")
    String description;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", updatable = false)
    Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "updated_at")
    Date updatedAt;

    @OneToMany(mappedBy = "organization")
    @ToString.Exclude
    List<BoardingHouse> boardingHouses;

    @OneToMany(mappedBy = "organization")
    @ToString.Exclude
    List<Contract> contracts;

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
