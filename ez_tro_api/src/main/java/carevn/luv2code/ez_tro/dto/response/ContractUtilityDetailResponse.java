package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractUtilityDetailResponse {
    Integer utilityId;
    String name;
    String type;
    BigDecimal unitPrice;
    String unit;
    Integer quantity;
    BigDecimal usageAmount;
    String note;
}
