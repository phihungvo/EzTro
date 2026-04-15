package carevn.luv2code.ez_tro.dto.requests;

import java.util.Date;

import carevn.luv2code.ez_tro.enums.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantRequest {

    @NotBlank(message = "Họ và tên không được để trống")
    String fullName;

    String phoneNumber;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    String password;

    String identityNumber;

    Date issueDate;

    String issuePlace;

    Date dateOfBirth;

    Gender gender;

    String occupation;

    String permanentAddress;

    String emergencyContact;

    String emergencyPhone;

    String note;
}
