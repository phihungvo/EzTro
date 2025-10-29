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
@Table(name = "room_utilities")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomUtility {

    @EmbeddedId
    RoomUtilityId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("roomId")
    @JoinColumn(name = "room_id")
    Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("utilityId")
    @JoinColumn(name = "utility_id")
    Utility utility;

    @Min(value = 1, message = "Số lượng phải >= 1")
    @NotNull
    @Column(nullable = false)
    Integer quantity = 1;

    @Column(precision = 8, scale = 2)
    BigDecimal usageAmount;

    @NotNull
    @Column(nullable = false)
    LocalDate startDate;

    @Column
    LocalDate endDate;

    @Column(length = 300)
    String note;

    @CreationTimestamp
    @Column(updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updatedAt;
}
