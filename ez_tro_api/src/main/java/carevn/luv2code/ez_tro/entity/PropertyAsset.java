package carevn.luv2code.ez_tro.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;

import carevn.luv2code.ez_tro.enums.PropertyAssetCategory;
import carevn.luv2code.ez_tro.enums.PropertyAssetCondition;
import carevn.luv2code.ez_tro.enums.PropertyAssetStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "property_assets")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PropertyAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "asset_code", nullable = false, length = 50, unique = true)
    String assetCode;

    @Column(name = "asset_name", nullable = false, length = 200)
    String assetName; // Tên tài sản, ví dụ: "Tủ lạnh Samsung 300L", "Bàn học gỗ sồi", v.v.

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    PropertyAssetCategory category; // Loại tài sản, ví dụ: Nội thất, Điện tử, Thiết bị, v.v.

    @Column(columnDefinition = "TEXT")
    String specification; // Thông số kỹ thuật, mô tả chi tiết về tài sản

    @Column(length = 100)
    String brand; // Thương hiệu, ví dụ: "Samsung", "IKEA", "Sony", v.v.

    @Column(length = 100)
    String model; // Mẫu mã, ví dụ: "RT30T5032S8", "LACK", "Xperia Z5", v.v.

    @Column(name = "serial_number", length = 100, unique = true)
    String serialNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "boarding_house_id", nullable = false)
    BoardingHouse boardingHouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id")
    Building building;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    Room room;

    @Column(name = "purchase_date")
    LocalDate purchaseDate; // Ngày mua tài sản, có thể dùng để tính bảo hành, khấu hao, v.v.

    @Column(name = "purchase_price", precision = 15, scale = 2)
    BigDecimal purchasePrice; // Giá mua ban đầu

    @Column(name = "warranty_months")
    Integer warrantyMonths; // Số tháng bảo hành từ ngày mua

    @Column(name = "warranty_expiry")
    LocalDate warrantyExpiry; // Ngày hết hạn bảo hành, có thể tính từ purchaseDate + warrantyMonths

    @Column(name = "install_date")
    LocalDate installDate; // Ngày lắp đặt vào phòng (nếu có), dùng để theo dõi thời gian sử dụng thực tế

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    PropertyAssetStatus status; // Trạng thái tài sản, ví dụ: Sử dụng, Hỏng hóc, Đang sửa chữa, Thanh lý, v.v.

    @Enumerated(EnumType.STRING)
    @Column(name = "asset_condition", nullable = false, length = 30)
    PropertyAssetCondition condition; // Tình trạng tài sản, ví dụ: Mới, Tốt, Trung bình, Kém, Hỏng, v.v.

    @Column(name = "last_maintenance_date")
    LocalDate lastMaintenanceDate; // Ngày bảo trì gần nhất, dùng để theo dõi lịch bảo trì định kỳ

    @Column(name = "next_maintenance_date")
    LocalDate nextMaintenanceDate; // Ngày bảo trì tiếp theo, có thể tính từ lastMaintenanceDate + maintenanceCycle

    @Column(name = "maintenance_cycle")
    Integer maintenanceCycle; // Chu kỳ bảo trì định kỳ (số tháng), dùng để tự động tính nextMaintenanceDate

    @Column(name = "depreciation_rate", precision = 5, scale = 2)
    BigDecimal
            depreciationRate; // Tỷ lệ khấu hao hàng năm (%), dùng để tính giá trị hiện tại của tài sản theo thời gian

    @Column(name = "current_value", precision = 15, scale = 2)
    BigDecimal currentValue; // Giá trị hiện tại của tài sản, có thể tính từ purchasePrice và depreciationRate theo thời
    // gian sử dụng

    @Column(length = 150)
    String supplier; // Nhà cung cấp, có thể dùng để liên hệ khi cần bảo hành, sửa chữa, hoặc mua mới tài sản tương tự

    @Column(name = "supplier_phone", length = 20)
    String supplierPhone;

    @Column(columnDefinition = "TEXT")
    String notes;

    @Column(name = "assigned_to", length = 100)
    String assignedTo; // Người được giao quản lý hoặc sử dụng tài sản, có thể là nhân viên quản lý, người thuê phòng,
    // v.v.

    @Column(name = "assigned_date")
    LocalDate assignedDate;

    @Column(name = "is_deleted", nullable = false)
    Boolean isDeleted = false;

    @OneToMany(mappedBy = "propertyAsset", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("actionDate DESC, id DESC")
    List<PropertyAssetHistory> histories; // Lịch sử thay đổi trạng thái, bảo trì, sửa chữa, v.v. của tài sản

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
