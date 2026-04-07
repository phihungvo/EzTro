package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DebtAgingBucketResponse {
    String bucketCode;
    String label;
    Integer invoiceCount;
    BigDecimal outstandingAmount;
}
