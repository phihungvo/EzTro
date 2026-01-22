package carevn.luv2code.ez_tro.dto.requests;

import java.time.LocalDate;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class MeterPeriodRequest {
    @Min(1)
    @Max(12)
    private Integer periodMonth;

    @Min(2000)
    private Integer periodYear;

    private LocalDate startDate;

    private LocalDate endDate;
}
