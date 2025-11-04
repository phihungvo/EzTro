package carevn.luv2code.ez_tro.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import carevn.luv2code.ez_tro.enums.IncidentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "incident_reports")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class IncidentReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    Room room;

    @Column(nullable = false, length = 200)
    String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    IncidentStatus status = IncidentStatus.PENDING;

    //    @Enumerated(EnumType.STRING)
    //    @Column(nullable = false)
    //    IncidentPriority priority = IncidentPriority.MEDIUM;
    //
    //    @ElementCollection
    //    @CollectionTable(name = "incident_images", joinColumns = @JoinColumn(name = "incident_id"))
    //    @Column(name = "image_url")
    //    List<String> imageUrls;
    //
    //    @Column(length = 100)
    //    String handledBy;

    @Column(columnDefinition = "TEXT")
    String resolveNote;

    LocalDate expectedResolveDate; // Ngày dự kiến xử lý xong

    LocalDateTime resolvedAt; // Ngày xử lý xong

    @Column(precision = 15, scale = 2)
    BigDecimal repairCost; // Chi phí sửa chữa

    @CreationTimestamp
    @Column(updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updatedAt;
}
