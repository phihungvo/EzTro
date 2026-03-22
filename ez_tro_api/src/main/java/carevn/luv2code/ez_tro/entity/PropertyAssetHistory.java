package carevn.luv2code.ez_tro.entity;

import java.time.LocalDateTime;

import carevn.luv2code.ez_tro.enums.PropertyAssetAction;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "property_asset_histories")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PropertyAssetHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_asset_id", nullable = false)
    PropertyAsset propertyAsset;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    PropertyAssetAction action;

    @Column(name = "action_date", nullable = false)
    LocalDateTime actionDate;

    @Column(name = "performed_by", length = 100)
    String performedBy;

    @Column(columnDefinition = "TEXT")
    String note;
}
