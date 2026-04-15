package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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

    List<Integer> boardingHouseIds;

    List<String> boardingHouseNames;

    Integer ownerId;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;
}
