package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;

import carevn.luv2code.ez_tro.enums.PropertyAssetCategory;
import carevn.luv2code.ez_tro.enums.PropertyAssetCondition;
import carevn.luv2code.ez_tro.enums.PropertyAssetStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyAssetResponse {
    Integer id;
    String assetCode;
    String assetName;
    PropertyAssetCategory category;
    String specification;
    String brand;
    String model;
    String serialNumber;
    Integer boardingHouseId;
    String boardingHouseName;
    Integer buildingId;
    String buildingName;
    Integer roomId;
    String roomNumber;
    LocalDate purchaseDate;
    BigDecimal purchasePrice;
    Integer warrantyMonths;
    LocalDate warrantyExpiry;
    LocalDate installDate;
    PropertyAssetStatus status;
    PropertyAssetCondition condition;
    LocalDate lastMaintenanceDate;
    LocalDate nextMaintenanceDate;
    Integer maintenanceCycle;
    BigDecimal depreciationRate;
    BigDecimal currentValue;
    String supplier;
    String supplierPhone;
    String notes;
    String assignedTo;
    LocalDate assignedDate;
    Date createdAt;
    Date updatedAt;
    List<PropertyAssetHistoryResponse> histories;
}
