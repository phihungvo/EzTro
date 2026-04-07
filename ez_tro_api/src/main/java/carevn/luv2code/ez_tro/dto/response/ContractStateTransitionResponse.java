package carevn.luv2code.ez_tro.dto.response;

import java.util.Date;

import carevn.luv2code.ez_tro.enums.ContractLifecycleState;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractStateTransitionResponse {
    Integer id;
    ContractLifecycleState fromState;
    ContractLifecycleState toState;
    String reason;
    String metadataJson;
    Integer changedBy;
    String changedByName;
    Date changedAt;
}
