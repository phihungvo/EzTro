package carevn.luv2code.ez_tro.dto.requests;

import java.util.Date;

import carevn.luv2code.ez_tro.enums.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantCreateRequest {

    @NotBlank(message = "Họ và tên không được để trống")
    String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    String phoneNumber;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    String password;

    @NotBlank(message = "Số giấy tờ không được để trống")
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

    @NotNull(message = "Khu nhà trọ không được để trống")
    @Positive(message = "Khu nhà trọ không hợp lệ")
    Integer boardingHouseId;

    @NotNull(message = "Toà nhà không được để trống")
    @Positive(message = "Toà nhà không hợp lệ")
    Integer buildingId;
}
