package carevn.luv2code.ez_tro.dto.requests;

import java.math.BigDecimal;
import java.util.List;

import carevn.luv2code.ez_tro.enums.ServiceType;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AmenityRequest {

    @NotBlank
    String name;

    @NotNull
    ServiceType type;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    BigDecimal price;

    @Size(max = 255)
    String unit;

    String description;

    @NotNull
    List<Integer> boardingHouseIds;

    @NotNull
    List<Integer> roomIds;
}
