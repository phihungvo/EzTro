package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UtilityResponse {
    Integer id;

    String name;

    String description;

    String type;

    BigDecimal unitPrice;

    String unit;

    Boolean isActive;

    Integer boardingHouseId;

    String boardingHouseName;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;
}
