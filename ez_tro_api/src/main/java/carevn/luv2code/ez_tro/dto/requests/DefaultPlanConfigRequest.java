package carevn.luv2code.ez_tro.dto.requests;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DefaultPlanConfigRequest {
    @NotNull(message = "Plan ID không được để trống")
    private Integer planId;
}
