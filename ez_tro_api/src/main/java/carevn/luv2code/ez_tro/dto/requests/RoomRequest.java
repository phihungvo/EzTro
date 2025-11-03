package carevn.luv2code.ez_tro.dto.requests;

import java.math.BigDecimal;
import java.util.List;

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

    Integer buildingId;

    BigDecimal area;

    BigDecimal price;

    RoomStatus status;

    String note;

    List<Integer> utilityIds;

    Integer floorNumber;

    Integer maxOccupants;

    Boolean hasAirConditioner = false;

    Boolean hasBathroom = true;

    Boolean hasKitchen = true;
}
