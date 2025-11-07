package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.util.Date;

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

    String buildingName;

    Date startDate;

    Date endDate;

    Integer floorNumber;

    Integer maxOccupants;

    Boolean hasAirConditioner = false;

    Boolean hasBathroom = true;

    Boolean hasKitchen = true;
}
