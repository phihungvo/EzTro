package carevn.luv2code.ez_tro.dto.requests;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreferenceChannelUpdateRequest {
    Boolean inApp;
    Boolean email;
    Boolean sms;
    Boolean zalo;
}
