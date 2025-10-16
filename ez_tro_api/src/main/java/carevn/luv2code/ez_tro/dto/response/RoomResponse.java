package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;

import carevn.luv2code.ez_tro.enums.RoomStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomResponse {
    Integer id;
    String roomNumber;
    BigDecimal area;
    BigDecimal price;
    RoomStatus status;
    String note;
    String boardingHouseName;
}
