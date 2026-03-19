package carevn.luv2code.ez_tro.dto.requests;

import java.util.Date;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractTenantRequest {
    @NotBlank(message = "Tenant full name is required")
    String fullName;

    @NotBlank(message = "Tenant phone number is required")
    String phoneNumber;

    @NotBlank(message = "Tenant email is required")
    @Email(message = "Tenant email is invalid")
    String email;

    @NotBlank(message = "Tenant password is required")
    String password;

    @NotBlank(message = "Tenant identity number is required")
    String identityNumber;

    Date dateOfBirth;

    String occupation;

    String note;
}
