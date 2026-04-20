package carevn.luv2code.ez_tro.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "subscription_plans")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SubscriptionPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(unique = true, nullable = false, length = 50)
    String code; // FREE, BASIC, PRO, PREMIUM

    @Column(nullable = false, length = 100)
    String name;

    @Column(columnDefinition = "TEXT")
    String description; // Mô tả ngắn (hiển thị trên card pricing)

    @Column(columnDefinition = "LONGTEXT")
    String fullDescription; // Lưu Markdown

    @Column(nullable = false)
    Integer maxBoardingHouses = 1;

    @Column(nullable = false)
    Integer maxBuildings = 5;

    @Column(nullable = false)
    Integer maxRooms = 50;

    @Column(nullable = false)
    Integer maxTenants;

    @Column(nullable = false)
    Integer maxActiveContracts;

    @Column(precision = 12, scale = 2)
    BigDecimal pricePerMonth;

    @Column
    Integer durationDays; // null = vĩnh viễn

    @Column(nullable = false)
    Boolean isActive = true;

    @CreationTimestamp
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updatedAt;
}
