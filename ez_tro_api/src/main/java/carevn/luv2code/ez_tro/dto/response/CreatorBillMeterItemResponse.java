package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatorBillMeterItemResponse {
    private Integer utilityId;
    private String utilityName;
    private String unit;

    private BigDecimal previousIndex;
    private BigDecimal currentIndex;
    private BigDecimal unitPrice;
}
