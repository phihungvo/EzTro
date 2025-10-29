package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.util.Date;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CurrentRentalInfoResponse {
    String contractCode;
    String contractStatus;
    Boolean isLiving;
    Date startDate;
    Date endDate;
    BigDecimal rentPrice;
    BigDecimal deposit;
    Date moveInDate;
    Boolean isContractRepresentative;

    String roomName;
    Integer floorNumber;
    BigDecimal area;

    String boardingHouseName;
    String boardingHouseAddress;
}
