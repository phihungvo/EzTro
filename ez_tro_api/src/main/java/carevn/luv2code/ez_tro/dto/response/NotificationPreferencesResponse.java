package carevn.luv2code.ez_tro.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreferencesResponse {
    NotificationPreferenceChannelResponse billingIssue;
    NotificationPreferenceChannelResponse contractExpiring;
    NotificationPreferenceChannelResponse incidentUpdates;
    NotificationPreferenceChannelResponse announcements;
    NotificationPreferenceChannelResponse paymentUpdates;
    NotificationPreferenceChannelResponse securityAlerts;
    NotificationPreferenceChannelResponse subscriptionAlerts;
}
