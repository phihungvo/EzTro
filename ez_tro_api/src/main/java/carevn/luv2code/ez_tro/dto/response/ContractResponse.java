package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.util.Date;

import carevn.luv2code.ez_tro.enums.ContractStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractResponse {
    Integer id;
    String roomNumber;
    String tenantName;
    Date startDate;
    Date endDate;
    BigDecimal deposit;
    BigDecimal rentPrice;
    ContractStatus status;
    String note;
}
