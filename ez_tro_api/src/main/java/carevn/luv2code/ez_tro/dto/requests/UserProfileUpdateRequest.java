package carevn.luv2code.ez_tro.dto.requests;

import java.util.Date;

import carevn.luv2code.ez_tro.enums.Gender;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserProfileUpdateRequest {
    String fullName;
    String phoneNumber;
    String permanentAddress;

    String identityNumber;
    Date issueDate;
    String issuePlace;
    Date dateOfBirth;
    Gender gender;

    String occupation;
    String vehicleInfo;
    String emergencyContact;
    String emergencyPhone;
    String note;
}
