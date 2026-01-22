package carevn.luv2code.ez_tro.entity;

import java.math.BigDecimal;
import java.util.Date;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(
        name = "meter_readings",
        uniqueConstraints = @UniqueConstraint(columnNames = {"room_id", "utility_id", "period_month", "period_year"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(onlyExplicitlyIncluded = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MeterReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utility_id", nullable = false)
    Utility utility;

    @Column(name = "period_month", nullable = false)
    Integer periodMonth; // 1-12

    @Column(name = "period_year", nullable = false)
    Integer periodYear;

    @Column(name = "reading_date")
    @Temporal(TemporalType.DATE)
    Date readingDate;

    @Column(name = "previous_index", precision = 12, scale = 3)
    BigDecimal previousIndex = BigDecimal.ZERO;

    @Column(name = "current_index", precision = 12, scale = 3, nullable = false)
    BigDecimal currentIndex;

    @Column(name = "consumption", precision = 12, scale = 3)
    BigDecimal consumption;

    @Column(name = "unit_price", precision = 12, scale = 0)
    BigDecimal unitPrice;

    @Column(name = "amount", precision = 14, scale = 0)
    BigDecimal amount;

    @Column(length = 500)
    String note;

    @Column(name = "created_at", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    Date createdAt;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    Date updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Date();
    }
}
