package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.util.Date;

import carevn.luv2code.ez_tro.enums.PaymentAllocationType;
import carevn.luv2code.ez_tro.enums.PaymentSource;
import carevn.luv2code.ez_tro.enums.PaymentStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillAllocationDetailResponse {
    Integer id;
    Integer paymentId;
    String externalReference;
    PaymentSource paymentSource;
    PaymentStatus paymentStatus;
    String paymentMethod;
    BigDecimal amount;
    PaymentAllocationType allocationType;
    String note;
    Date receivedAt;
    Date confirmedAt;
    Date createdAt;
}
