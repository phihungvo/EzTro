package carevn.luv2code.ez_tro.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
@Table(name = "utilities")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Utility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @ToString.Include
    @EqualsAndHashCode.Include
    Integer id;

    @NotBlank(message = "Tên tiện ích bắt buộc")
    @Column(nullable = false, length = 100)
    String name; // e.g., "Điện", "Internet"

    @Column(length = 255)
    String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    ServiceType type = ServiceType.FIXED;

    @Min(value = 0, message = "Giá phải >= 0")
    @NotNull
    @Column(nullable = false, precision = 10, scale = 2)
    BigDecimal unitPrice;

    @Column(length = 50)
    String unit; // e.g., "kWh", "m³", "tháng"

    @Column(nullable = false)
    Boolean isActive = true;

    @CreationTimestamp
    @Column(updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updatedAt;

    @ManyToMany
    @JoinTable(
            name = "utility_boarding_houses",
            joinColumns = @JoinColumn(name = "utility_id"),
            inverseJoinColumns = @JoinColumn(name = "boarding_house_id"))
    @ToString.Exclude
    @Builder.Default
    Set<BoardingHouse> boardingHouses = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    User owner;

    @OneToMany(mappedBy = "utility", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    List<RoomUtility> roomUtilities;
}
