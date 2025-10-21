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

    String contractCode;

    Integer roomId;

    String roomNumber;

    String boardingHouseName;

    Integer tenantId;

    Integer userId;

    String tenantName;

    String tenantFullName;

    Date startDate;

    Date endDate;

    BigDecimal deposit;

    BigDecimal rentPrice;

    ContractStatus status;

    String note;

    Date createdAt;

    Date updatedAt;
}
