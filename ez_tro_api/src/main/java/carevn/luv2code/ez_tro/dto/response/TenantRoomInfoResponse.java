package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TenantRoomInfoResponse {
    String boardingHouseName;

    String roomNumber;

    String buildingName;

    Integer floor;

    BigDecimal area;

    BigDecimal price;

    String status;
}
