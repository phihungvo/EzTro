package carevn.luv2code.ez_tro.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "room_amenities")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomAmenity {

    @EmbeddedId
    RoomAmenityId id;

    @ManyToOne
    @MapsId("roomId")
    @JoinColumn(name = "room_id")
    Room room;

    @ManyToOne
    @MapsId("amenityId")
    @JoinColumn(name = "amenity_id")
    Amenity amenity;

    @Min(value = 1, message = "Số lượng phải >= 1")
    @NotNull
    @Column(nullable = false)
    Integer quantity = 1; // Số lượng đăng ký (xe giữ xe, người dùng internet)

    @Column(precision = 8, scale = 2)
    BigDecimal usageAmount; // Lượng tiêu thụ (kWh cho điện, chỉ cho type USAGE_BASED)

    @NotNull
    @Column(nullable = false)
    LocalDate startDate; // Ngày bắt đầu dùng tiện ích

    @Column
    LocalDate endDate; // Ngày kết thúc (optional)

    @Column(length = 300)
    String note;

    @CreationTimestamp
    @Column(updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updatedAt;
}
