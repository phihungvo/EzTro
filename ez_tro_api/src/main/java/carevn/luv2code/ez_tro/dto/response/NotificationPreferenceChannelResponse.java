package carevn.luv2code.ez_tro.dto.response;

import java.util.List;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreferenceChannelResponse {
    Boolean inApp;
    Boolean email;
    Boolean sms;
    Boolean zalo;
    List<String> mandatoryChannels;
}
