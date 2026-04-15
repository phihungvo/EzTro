package carevn.luv2code.ez_tro.dto.requests;

import java.math.BigDecimal;
import java.util.Date;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MeterReadingRequest {

    @NotNull
    Integer roomId;

    @NotNull
    Integer utilityId;

    @Min(1)
    @Max(12)
    Integer periodMonth;

    @Min(2000)
    Integer periodYear;

    @NotNull
    @DecimalMin("0.0")
    BigDecimal currentIndex;

    @DecimalMin("0.0")
    BigDecimal unitPrice;

    Date readingDate;

    String note;
}
