package carevn.luv2code.ez_tro.dto.requests;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ElectricWaterRecordRequest {
    @NotNull(message = "Phòng không được để trống")
    Integer roomId;

    @NotNull(message = "Tháng không được để trống")
    @Min(1)
    @Max(12)
    Integer month;

    @NotNull(message = "Năm không được để trống")
    @Min(2000)
    Integer year;

    @Min(0)
    Integer electricStart;

    @Min(0)
    Integer electricEnd;

    @Min(0)
    Integer waterStart;

    @Min(0)
    Integer waterEnd;
}
