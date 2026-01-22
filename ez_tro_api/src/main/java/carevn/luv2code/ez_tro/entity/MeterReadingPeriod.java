package carevn.luv2code.ez_tro.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import carevn.luv2code.ez_tro.enums.PeriodStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(
        name = "meter_reading_periods",
        uniqueConstraints = @UniqueConstraint(columnNames = {"period_month", "period_year"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MeterReadingPeriod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "period_month", nullable = false)
    Integer periodMonth; // 1-12

    @Column(name = "period_year", nullable = false)
    Integer periodYear;

    @Column(name = "start_date")
    LocalDate startDate;

    @Column(name = "end_date")
    LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    PeriodStatus status = PeriodStatus.DRAFT; // DRAFT, CONFIRMED, LOCKED

    @Column(name = "confirmed_at")
    LocalDateTime confirmedAt;

    @Column(name = "locked_at")
    LocalDateTime lockedAt;

    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    LocalDateTime updatedAt = LocalDateTime.now();
}
