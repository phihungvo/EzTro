package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.util.Date;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ElectricWaterRecordResponse {
    Integer id;

    Integer roomId;

    String roomNumber;

    String boardingHouseName;

    Integer month;

    Integer year;

    Integer electricStart;

    Integer electricEnd;

    BigDecimal electricUsage;

    BigDecimal electricCost;

    Integer waterStart;

    Integer waterEnd;

    BigDecimal waterUsage;

    BigDecimal waterCost;

    BigDecimal totalCost;

    String recordedBy;

    Date createdAt;
}
