package carevn.luv2code.ez_tro.dto.requests;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreferencesUpdateRequest {
    NotificationPreferenceChannelUpdateRequest billingIssue;
    NotificationPreferenceChannelUpdateRequest contractExpiring;
    NotificationPreferenceChannelUpdateRequest incidentUpdates;
    NotificationPreferenceChannelUpdateRequest announcements;
    NotificationPreferenceChannelUpdateRequest paymentUpdates;
    NotificationPreferenceChannelUpdateRequest securityAlerts;
    NotificationPreferenceChannelUpdateRequest subscriptionAlerts;
}
