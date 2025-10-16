package carevn.luv2code.ez_tro.dto.requests;

import java.math.BigDecimal;

import carevn.luv2code.ez_tro.enums.RoomStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomRequest {
    String roomNumber;

    Integer boardingHouseId;

    BigDecimal area;

    BigDecimal price;

    RoomStatus status;

    String note;
}
