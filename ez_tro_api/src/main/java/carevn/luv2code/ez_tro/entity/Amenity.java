package carevn.luv2code.ez_tro.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import carevn.luv2code.ez_tro.enums.ServiceType;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
@Table(name = "amenities")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Amenity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @ToString.Include
    @EqualsAndHashCode.Include
    Integer id;

    @NotBlank(message = "Tên tiện ích bắt buộc")
    @Column(nullable = false, length = 100)
    String name; // Ví dụ: "Điện", "Internet"

    @Column(length = 255)
    String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    ServiceType type = ServiceType.FIXED;

    @Min(value = 0, message = "Giá phải >= 0")
    @NotNull
    @Column(nullable = false, precision = 10, scale = 2)
    BigDecimal unitPrice; // Giá/đơn vị (kWh cho điện, tháng cho internet)

    @Column(length = 50)
    String unit;

    @Column
    Boolean isActive = true;

    @CreationTimestamp
    @Column(updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "boarding_house_id")
    BoardingHouse boardingHouse; // Tiện ích thuộc khu (optional)

    @OneToMany(mappedBy = "amenity", cascade = CascadeType.ALL, orphanRemoval = true)
    List<RoomAmenity> roomAmenities;
}
