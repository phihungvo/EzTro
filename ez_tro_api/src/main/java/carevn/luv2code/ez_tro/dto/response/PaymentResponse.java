package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

import carevn.luv2code.ez_tro.enums.PaymentStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {
    Integer id;
    Integer contractId;
    Integer tenantId;
    BigDecimal amount;
    String currency;
    String externalReference;
    PaymentStatus status;
    BigDecimal allocatedAmount;
    BigDecimal unallocatedAmount;
    Date receivedAt;
    Date confirmedAt;
    Date createdAt;
    List<PaymentAllocationResponse> allocations;
}
