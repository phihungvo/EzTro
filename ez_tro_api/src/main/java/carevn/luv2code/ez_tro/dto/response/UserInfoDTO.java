package carevn.luv2code.ez_tro.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserInfoDTO {
    Long id;

    String firstName;

    String lastName;

    String fullName;
}
