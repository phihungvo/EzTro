package carevn.luv2code.ez_tro.dto.requests;

import java.math.BigDecimal;
import java.util.Date;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentReceiveRequest {

    @NotNull(message = "Contract ID không được để trống")
    Integer contractId;

    @NotNull(message = "Số tiền không được để trống")
    @Positive(message = "Số tiền phải > 0")
    BigDecimal amount;

    String currency;

    @NotBlank(message = "External reference không được để trống")
    String externalReference;

    Date receivedAt;

    String note;
}
