package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentAllocationSummaryResponse {
    Integer paymentId;
    BigDecimal totalAmount;
    BigDecimal allocatedAmount;
    BigDecimal unallocatedAmount;
    List<PaymentAllocationResponse> allocations;
}
