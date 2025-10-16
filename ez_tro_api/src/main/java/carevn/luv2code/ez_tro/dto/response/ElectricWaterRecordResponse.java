package carevn.luv2code.ez_tro.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ElectricWaterRecordResponse {
    Integer id;
    String roomNumber;
    Integer month;
    Integer year;
    Integer electricStart;
    Integer electricEnd;
    Integer waterStart;
    Integer waterEnd;
}
