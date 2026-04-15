package carevn.luv2code.ez_tro.dto.requests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class NotificationPreferenceChannelUpdateRequest {
    Boolean inApp;
    Boolean email;
    Boolean sms;
    Boolean zalo;
}
