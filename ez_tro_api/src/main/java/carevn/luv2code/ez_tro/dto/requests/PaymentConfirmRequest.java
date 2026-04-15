package carevn.luv2code.ez_tro.dto.requests;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentConfirmRequest {
    String note;
    String evidenceReference;
}
