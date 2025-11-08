package carevn.luv2code.ez_tro.dto.requests;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OwnerRequest {
    @NotBlank
    @Size(min = 3, max = 50)
    String userName;

    @NotBlank
    @Email
    String email;

    @NotBlank
    @Size(min = 6)
    String password;

    String firstName;

    String lastName;

    @Pattern(regexp = "^0[3|5|7|8|9]\\d{8}$")
    String phoneNumber;

    String address;
}
