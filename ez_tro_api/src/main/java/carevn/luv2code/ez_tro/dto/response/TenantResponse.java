package carevn.luv2code.ez_tro.dto.response;

import java.util.Date;

import carevn.luv2code.ez_tro.enums.Gender;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantResponse {
    Integer id;

    String fullName;

    String email;

    String identityNumber;

    Date dateOfBirth;

    Gender gender;

    String occupation;

    String note;
}
