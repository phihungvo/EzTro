package carevn.luv2code.ez_tro.dto.response;

import java.util.Date;

import carevn.luv2code.ez_tro.enums.BillingAuditTargetType;
import carevn.luv2code.ez_tro.enums.BillingOperationType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillingOperationLogResponse {
    Integer id;
    Integer contractId;
    BillingAuditTargetType targetType;
    Integer targetId;
    BillingOperationType operationType;
    String requestId;
    Integer actorId;
    String actorName;
    Object beforeState;
    Object afterState;
    Object metadata;
    Date createdAt;
}
