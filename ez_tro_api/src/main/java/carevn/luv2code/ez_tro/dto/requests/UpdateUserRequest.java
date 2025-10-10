package carevn.luv2code.ez_tro.dto.requests;

import java.util.Set;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UpdateUserRequest {
    @Email(message = "Email should be valid")
    private String email;

    private String fullName;
    private Boolean enabled;
    private Set<Integer> roleIds;
}
