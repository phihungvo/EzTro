package carevn.luv2code.ez_tro.dto.requests;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ElectricWaterRecordRequest {
    Integer roomId;

    Integer month;

    Integer year;

    Integer electricStart;

    Integer electricEnd;

    Integer waterStart;

    Integer waterEnd;
}
