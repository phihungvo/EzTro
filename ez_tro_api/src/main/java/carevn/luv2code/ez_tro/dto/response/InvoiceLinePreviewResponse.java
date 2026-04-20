package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;

import carevn.luv2code.ez_tro.enums.BillLineType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceLinePreviewResponse {
    BillLineType lineType;
    String lineKey;
    String description;
    BigDecimal quantity;
    BigDecimal unitPrice;
    BigDecimal amount;
    Integer utilityId;
    String metadataJson;
}
