package carevn.luv2code.ez_tro.dto.requests;

import java.math.BigDecimal;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceServiceRequest {
    Integer utilityId;
    String utilityName;
    String type;
    String unit;
    BigDecimal unitPrice;
    Integer quantity;
    Boolean checked;
}
