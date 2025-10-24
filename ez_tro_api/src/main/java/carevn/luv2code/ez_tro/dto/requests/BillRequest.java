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

    String billTitle;

    Integer contractId;

    Integer tenantId;

    BigDecimal amount;

    Boolean paid;

    Date paymentDate;

    Date dueDate;
}
