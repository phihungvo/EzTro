package carevn.luv2code.ez_tro.dto.requests;

import java.math.BigDecimal;

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
public class UtilityRequest {

    @NotBlank(message = "Tên tiện ích bắt buộc")
    String name;

    String description;

    @NotNull(message = "Loại tiện ích bắt buộc")
    String type;

    @NotNull(message = "Giá đơn vị bắt buộc")
    @Min(value = 0, message = "Giá phải >= 0")
    BigDecimal unitPrice;

    String unit;

    Boolean isActive;

    Integer boardingHouseId;
}
