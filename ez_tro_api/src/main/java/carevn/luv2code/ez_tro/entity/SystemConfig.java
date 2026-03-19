package carevn.luv2code.ez_tro.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(
        name = "system_configs",
        uniqueConstraints = @UniqueConstraint(name = "uk_system_configs_key", columnNames = "config_key"))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SystemConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "config_key", nullable = false, length = 100)
    String key;

    @Column(name = "config_value", nullable = false, columnDefinition = "TEXT")
    String value;

    @Column(columnDefinition = "TEXT")
    String description;

    @Column(name = "created_at", updatable = false)
    @CreationTimestamp
    LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    LocalDateTime updatedAt;
}
