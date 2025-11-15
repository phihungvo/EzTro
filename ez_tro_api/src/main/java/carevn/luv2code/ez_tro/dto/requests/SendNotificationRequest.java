package carevn.luv2code.ez_tro.dto.requests;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SendNotificationRequest {
    String title;

    String message;

    String type = "SYSTEM";

    Object data;
}
