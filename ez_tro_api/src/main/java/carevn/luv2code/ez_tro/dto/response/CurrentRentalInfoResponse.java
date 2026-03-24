package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

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
    LocalDate startDate;
    LocalDate endDate;
    Boolean autoRenew;
    BigDecimal rentPrice;
    BigDecimal deposit;
    LocalDate moveInDate;
    Boolean isContractRepresentative;

    String roomName;
    Integer floorNumber;
    BigDecimal area;

    String boardingHouseName;
    String boardingHouseAddress;
}
