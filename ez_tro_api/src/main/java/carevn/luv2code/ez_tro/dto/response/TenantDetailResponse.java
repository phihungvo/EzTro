package carevn.luv2code.ez_tro.dto.response;

import java.util.Date;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TenantDetailResponse {
    Integer id;

    String fullName;

    String email;

    String phoneNumber;

    String identityNumber;

    Date issueDate;

    String issuePlace;

    Date dateOfBirth;

    String gender;

    Boolean isLiving;

    String contractStatus;

    String occupation;

    String permanentAddress;

    String vehicleInfo;

    String emergencyContact;

    String emergencyPhone;

    String note;

    Date createdAt;

    Date updatedAt;
}
