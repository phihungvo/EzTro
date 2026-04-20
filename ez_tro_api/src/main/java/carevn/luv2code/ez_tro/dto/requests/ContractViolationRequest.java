package carevn.luv2code.ez_tro.dto.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractViolationRequest {
    @NotBlank
    private String reason;

    private String evidence;
}
