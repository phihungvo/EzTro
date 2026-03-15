package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatorBillUtilityItemResponse {
    private Integer id;
    private String name;
    private String type;
    private BigDecimal unitPrice;
    private String unit;
}
