package carevn.luv2code.ez_tro.dto.requests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class NotificationPreferencesUpdateRequest {
    NotificationPreferenceChannelUpdateRequest billingIssue;
    NotificationPreferenceChannelUpdateRequest contractExpiring;
    NotificationPreferenceChannelUpdateRequest incidentUpdates;
    NotificationPreferenceChannelUpdateRequest announcements;
    NotificationPreferenceChannelUpdateRequest paymentUpdates;
    NotificationPreferenceChannelUpdateRequest securityAlerts;
    NotificationPreferenceChannelUpdateRequest subscriptionAlerts;
}
