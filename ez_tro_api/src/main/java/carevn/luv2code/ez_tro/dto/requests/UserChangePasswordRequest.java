package carevn.luv2code.ez_tro.dto.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserChangePasswordRequest {
    @NotBlank
    String currentPassword;

    @NotBlank
    String newPassword;
}
