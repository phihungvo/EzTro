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
public class MeterReadingResponse {
    Integer id;

    Integer roomId;

    String roomNumber;

    Integer utilityId;

    String utilityName;

    Integer periodMonth;

    Integer periodYear;

    BigDecimal previousIndex;

    BigDecimal currentIndex;

    BigDecimal consumption;

    BigDecimal unitPrice;

    BigDecimal amount;

    String note;

    Date readingDate;

    Date createdAt;
}
