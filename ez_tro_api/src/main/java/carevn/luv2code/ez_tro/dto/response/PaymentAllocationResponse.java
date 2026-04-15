package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.util.Date;

import carevn.luv2code.ez_tro.enums.PaymentAllocationType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentAllocationResponse {
    Integer id;
    Integer paymentId;
    Integer billId;
    BigDecimal amount;
    PaymentAllocationType allocationType;
    String note;
    Date createdAt;
}
