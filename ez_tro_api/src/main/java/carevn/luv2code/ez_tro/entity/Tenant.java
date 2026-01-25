package carevn.luv2code.ez_tro.entity;

import java.util.Date;
import java.util.List;

import carevn.luv2code.ez_tro.enums.Gender;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "tenants")
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @ToString.Exclude
    User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "identity_number", length = 20)
    String identityNumber;

    @Temporal(TemporalType.DATE)
    @Column(name = "issue_date")
    Date issueDate;

    @Column(name = "issue_place", length = 100)
    String issuePlace;

    @Temporal(TemporalType.DATE)
    @Column(name = "date_of_birth")
    Date dateOfBirth;

    @Enumerated(EnumType.STRING)
    Gender gender;

    @Column(length = 100)
    String occupation; // Nghề nghiệp

    @Column(name = "permanent_address", length = 255) // Địa chỉ thường trú (moved from User if needed, or add here)
    String permanentAddress;

    @Column(name = "vehicle_info", length = 255) // Thông tin xe
    String vehicleInfo;

    @Column(name = "emergency_contact", length = 100) // Người liên hệ khẩn cấp
    String emergencyContact;

    @Column(name = "emergency_phone", length = 20) // SĐT liên hệ khẩn cấp
    String emergencyPhone;

    @Column(columnDefinition = "TEXT")
    String note;

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

    @OneToMany(mappedBy = "tenant", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    List<Contract> contracts;
}
