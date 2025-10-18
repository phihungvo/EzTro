package carevn.luv2code.ez_tro.entity;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

import carevn.luv2code.ez_tro.enums.RoomStatus;
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
@Table(name = "rooms")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    Integer id;

    @Column(name = "room_number", nullable = false, length = 50)
    String roomNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id", nullable = false)
    @ToString.Exclude
    Building building;

    // Kế thừa để biết thuộc khu nhà trọ nào
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "boarding_house_id", nullable = false)
    @ToString.Exclude
    BoardingHouse boardingHouse;

    @Column(precision = 6, scale = 2)
    BigDecimal area;

    @Column(precision = 12, scale = 2, nullable = false)
    BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    RoomStatus status = RoomStatus.AVAILABLE;

    @Column(columnDefinition = "TEXT")
    String note;

    @Column(name = "floor_number")
    Integer floorNumber;

    @Column(name = "max_occupants")
    Integer maxOccupants;

    @Column(name = "has_air_conditioner", nullable = false)
    Boolean hasAirConditioner = false;

    @Column(name = "has_bathroom", nullable = false)
    Boolean hasBathroom = true;

    @Column(name = "has_kitchen", nullable = false)
    Boolean hasKitchen = false;

    @Column(name = "is_deleted", nullable = false)
    Boolean isDeleted = false;

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

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    List<Contract> contracts;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    List<ElectricWaterRecord> electricWaterRecords;
}
