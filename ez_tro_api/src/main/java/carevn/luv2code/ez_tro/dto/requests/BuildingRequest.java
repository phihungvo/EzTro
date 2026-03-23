package carevn.luv2code.ez_tro.dto.requests;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BuildingRequest {

    @NotBlank(message = "Building name is required")
    String name;

    String description;

    @Min(value = 1, message = "Total floors must be greater than or equal to 1")
    Integer totalFloors;

    @NotNull(message = "Boarding house is required")
    Integer boardingHouseId; // ID nhà trọ chứa tòa nhà
}
