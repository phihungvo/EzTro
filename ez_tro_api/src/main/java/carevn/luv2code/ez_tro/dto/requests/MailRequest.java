package carevn.luv2code.ez_tro.dto.requests;

import java.util.List;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Setter
@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MailRequest {
    @NotEmpty
    List<@Email String> to;

    List<@Email String> cc;

    List<@Email String> bcc;

    @NotBlank
    @Size(max = 200)
    String subject;

    @NotBlank
    String body;

    boolean html = true;
}
