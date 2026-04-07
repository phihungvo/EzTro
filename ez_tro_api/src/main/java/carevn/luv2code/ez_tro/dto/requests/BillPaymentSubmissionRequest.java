package carevn.luv2code.ez_tro.dto.requests;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillPaymentSubmissionRequest {

    @NotNull(message = "Số tiền không được để trống")
    @Positive(message = "Số tiền phải > 0")
    BigDecimal amount;

    String currency;

    String externalReference;

    @NotBlank(message = "Phương thức thanh toán không được để trống")
    String paymentMethod;

    Integer proofFileId;

    String note;
}
