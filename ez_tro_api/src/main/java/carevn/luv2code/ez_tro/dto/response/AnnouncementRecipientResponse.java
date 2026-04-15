package carevn.luv2code.ez_tro.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnouncementRecipientResponse {
    Integer userId;
    String fullName;
    String email;
    String role;
}
