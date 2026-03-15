package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.util.List;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatorBillContextResponse {

    private Integer roomId;
    private String roomNumber;

    private Integer contractId;
    private BigDecimal rentPrice;

    private List<CreatorBillUtilityItemResponse> usageBasedUtilities;
    private List<CreatorBillMeterItemResponse> meterReadings;
}
