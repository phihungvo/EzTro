package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.util.Date;

import carevn.luv2code.ez_tro.enums.ContractStatus;
import carevn.luv2code.ez_tro.enums.PaymentMethod;
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

    Boolean autoRenew;

    BigDecimal deposit;

    BigDecimal rentPrice;

    ContractStatus status;

    String note;

    Integer fileCount;

    Date depositReceivedAt;

    PaymentMethod depositPaymentMethod;

    Integer paymentCycleMonths;

    Integer monthlyPaymentDay;

    Date createdAt;

    Date updatedAt;
}
