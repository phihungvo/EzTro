package carevn.luv2code.ez_tro.dto.requests;

import java.util.List;

import jakarta.validation.Valid;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentAllocateRequest {
    @Valid
    List<PaymentAllocationItemRequest> allocations;

    String note;
}
