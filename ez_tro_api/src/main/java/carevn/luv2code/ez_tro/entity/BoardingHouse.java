package carevn.luv2code.ez_tro.entity;

import java.util.Date;
import java.util.List;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "boarding_houses")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BoardingHouse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    Integer id;

    @Column(nullable = false, length = 100)
    String name;

    @Column(nullable = false, length = 255)
    String address;

    @Column(nullable = false, length = 20)
    String contactPhone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    @ToString.Exclude
    User owner; // Chủ nhà trọ

    @Column(columnDefinition = "TEXT")
    String description;

    @Column(name = "total_rooms")
    Integer totalRooms = 0;

    @Column(name = "total_buildings")
    Integer totalBuildings = 0;

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

    // Một nhà trọ có nhiều tòa nhà
    @OneToMany(mappedBy = "boardingHouse", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    List<Building> buildings;
}
