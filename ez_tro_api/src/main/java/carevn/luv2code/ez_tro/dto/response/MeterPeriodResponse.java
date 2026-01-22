package carevn.luv2code.ez_tro.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MeterPeriodResponse {
    Integer id;

    Integer periodMonth;

    Integer periodYear;

    LocalDate startDate;

    LocalDate endDate;

    String status;

    LocalDateTime confirmedAt;

    LocalDateTime lockedAt;
}
