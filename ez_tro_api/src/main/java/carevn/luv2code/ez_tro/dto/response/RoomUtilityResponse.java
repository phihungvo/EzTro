package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomUtilityResponse {

    Integer roomId;
    String roomNumber;

    Integer utilityId;
    String utilityName;

    Integer quantity;
    BigDecimal usageAmount;

    LocalDate startDate;
    LocalDate endDate;

    String note;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
