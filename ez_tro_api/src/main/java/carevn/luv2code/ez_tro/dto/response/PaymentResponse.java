package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

import carevn.luv2code.ez_tro.enums.PaymentSource;
import carevn.luv2code.ez_tro.enums.PaymentStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {
    Integer id;
    Integer contractId;
    String contractCode;
    Integer tenantId;
    String tenantName;
    String roomNumber;
    String boardingHouseName;
    BigDecimal amount;
    String currency;
    String externalReference;
    PaymentSource source;
    PaymentStatus status;
    String paymentMethod;
    Integer submittedBillId;
    String submittedBillCode;
    Boolean submittedByTenant;
    String createdByName;
    Integer proofFileId;
    String proofFileName;
    BigDecimal allocatedAmount;
    BigDecimal unallocatedAmount;
    String note;
    Date receivedAt;
    Date confirmedAt;
    Date createdAt;
    List<PaymentAllocationResponse> allocations;
}
