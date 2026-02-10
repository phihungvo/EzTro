package carevn.luv2code.ez_tro.dto.response;

import java.time.LocalDateTime;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OwnerResponse {
    Integer id;

    String userName;

    String email;

    String fullName;

    String phoneNumber;

    String originalPassword;

    String address;

    LocalDateTime createdAt;

    boolean enabled;
}
