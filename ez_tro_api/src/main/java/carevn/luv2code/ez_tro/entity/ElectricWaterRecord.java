package carevn.luv2code.ez_tro.entity;

import java.util.Date;

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
@Table(name = "electric_water_records")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ElectricWaterRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    @ToString.Exclude
    Room room;

    @Column(name = "month", nullable = false)
    Integer month;

    @Column(name = "year", nullable = false)
    Integer year;

    @Column(name = "electric_start")
    Integer electricStart;

    @Column(name = "electric_end")
    Integer electricEnd;

    @Column(name = "water_start")
    Integer waterStart;

    @Column(name = "water_end")
    Integer waterEnd;

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
