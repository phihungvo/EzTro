package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.util.Date;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillResponse {
    Integer id;

    String billTitle;

    String tenantName;

    BigDecimal amount;

    Boolean paid;

    Date paymentDate;

    Date dueDate;

    Integer contractId;

    Date createdAt;

    Date updatedAt;
}
