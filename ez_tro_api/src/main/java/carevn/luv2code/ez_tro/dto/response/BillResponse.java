package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.util.Date;

import carevn.luv2code.ez_tro.enums.BillStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillResponse {
    Integer id;

    String billTitle;

    String billCode;

    String tenantName;

    BigDecimal amount;

    Boolean paid;

    Date paymentDate;

    Date dueDate;

    BillStatus status;

    Integer contractId;

    Date createdAt;

    Date updatedAt;
}
