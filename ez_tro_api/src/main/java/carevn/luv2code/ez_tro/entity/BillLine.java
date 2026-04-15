package carevn.luv2code.ez_tro.entity;

import java.math.BigDecimal;
import java.util.Date;

import carevn.luv2code.ez_tro.enums.BillLineType;
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
@Table(
        name = "bill_lines",
        uniqueConstraints =
                @UniqueConstraint(
                        name = "uk_bill_lines_bill_key",
                        columnNames = {"bill_id", "line_key"}))
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BillLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bill_id", nullable = false)
    @ToString.Exclude
    Bill bill;

    @Enumerated(EnumType.STRING)
    @Column(name = "line_type", nullable = false, length = 30)
    BillLineType lineType;

    @Column(name = "line_key", nullable = false, length = 120)
    String lineKey;

    @Column(length = 255)
    String description;

    @Column(precision = 12, scale = 3)
    BigDecimal quantity;

    @Column(name = "unit_price", precision = 12, scale = 2)
    BigDecimal unitPrice;

    @Column(precision = 14, scale = 2, nullable = false)
    BigDecimal amount;

    @Column(name = "utility_id")
    Integer utilityId;

    @Column(columnDefinition = "TEXT")
    String metadataJson;

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
