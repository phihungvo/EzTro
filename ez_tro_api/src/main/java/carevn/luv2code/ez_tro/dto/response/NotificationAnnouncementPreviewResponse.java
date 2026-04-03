package carevn.luv2code.ez_tro.dto.response;

import java.util.List;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationAnnouncementPreviewResponse {
    String targetType;
    Integer recipientCount;
    List<AnnouncementRecipientResponse> recipients;
}
