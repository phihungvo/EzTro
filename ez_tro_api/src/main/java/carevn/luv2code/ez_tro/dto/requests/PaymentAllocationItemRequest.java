package carevn.luv2code.ez_tro.dto.requests;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentAllocationItemRequest {
    @NotNull(message = "Bill ID không được để trống")
    Integer billId;

    @NotNull(message = "Số tiền phân bổ không được để trống")
    @Positive(message = "Số tiền phân bổ phải > 0")
    BigDecimal amount;
}
