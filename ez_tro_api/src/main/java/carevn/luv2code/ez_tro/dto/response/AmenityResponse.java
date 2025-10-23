package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import carevn.luv2code.ez_tro.enums.ServiceType;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AmenityResponse {
    Integer id;

    String name;

    ServiceType type;

    BigDecimal price;

    String unit;

    String description;

    Integer boardingHouseId;

    String boardingHouseName;

    Boolean isActive;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;
}
