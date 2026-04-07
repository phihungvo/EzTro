package carevn.luv2code.ez_tro.dto.response;

import java.time.LocalDateTime;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    Integer id;

    Integer eventId;

    String title;

    String message;

    String type;

    String eventKey;

    String category;

    String priority;

    String channel;

    String actionUrl;

    String actionLabel;

    String recipientRole;

    Object data;

    boolean read;

    LocalDateTime createdAt;
}
