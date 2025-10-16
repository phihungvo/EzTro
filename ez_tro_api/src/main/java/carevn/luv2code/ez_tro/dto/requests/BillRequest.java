package carevn.luv2code.ez_tro.dto.requests;

import java.math.BigDecimal;
import java.util.Date;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillRequest {
    Integer contractId;

    BigDecimal amount;

    Boolean paid;

    Date paymentDate;
}
