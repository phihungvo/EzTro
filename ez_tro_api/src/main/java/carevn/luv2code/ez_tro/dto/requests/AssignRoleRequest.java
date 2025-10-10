package carevn.luv2code.ez_tro.dto.requests;

import java.util.Set;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignRoleRequest {
    @NotNull(message = "User ID is required")
    private Integer userId;

    @NotEmpty(message = "Role IDs are required")
    private Set<Integer> roleIds;
}
