package carevn.luv2code.ez_tro.dto.requests;

import java.util.Date;

import carevn.luv2code.ez_tro.enums.Gender;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantRequest {
    Integer userId;

    String identityNumber;

    Date dateOfBirth;

    Gender gender;

    String occupation;

    String note;
}
