package carevn.luv2code.ez_tro.dto.requests;

import java.math.BigDecimal;
import java.time.LocalDate;

import carevn.luv2code.ez_tro.enums.PropertyAssetCategory;
import carevn.luv2code.ez_tro.enums.PropertyAssetCondition;
import carevn.luv2code.ez_tro.enums.PropertyAssetStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyAssetRequest {

    @NotBlank(message = "assetCode is required")
    String assetCode;

    @NotBlank(message = "assetName is required")
    String assetName;

    @NotNull(message = "category is required")
    PropertyAssetCategory category;

    @NotNull(message = "boardingHouseId is required")
    Integer boardingHouseId;

    Integer buildingId;

    Integer roomId;

    String specification;

    String brand;

    String model;

    String serialNumber;

    LocalDate purchaseDate;

    @DecimalMin(value = "0.00", inclusive = true, message = "purchasePrice must be >= 0")
    BigDecimal purchasePrice;

    @PositiveOrZero(message = "warrantyMonths must be >= 0")
    Integer warrantyMonths;

    LocalDate installDate;

    PropertyAssetStatus status;

    PropertyAssetCondition condition;

    LocalDate lastMaintenanceDate;

    @PositiveOrZero(message = "maintenanceCycle must be >= 0")
    Integer maintenanceCycle;

    @DecimalMin(value = "0.00", inclusive = true, message = "depreciationRate must be >= 0")
    BigDecimal depreciationRate;

    String supplier;

    String supplierPhone;

    String notes;

    String assignedTo;

    LocalDate assignedDate;
}
