package carevn.luv2code.ez_tro.dto.response;

import java.time.LocalDateTime;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDeliveryLogResponse {
    Integer id;
    Integer eventId;
    String eventKey;
    String title;
    String message;
    Integer recipientId;
    String recipientName;
    String recipientEmail;
    String recipientPhoneNumber;
    String channel;
    String status;
    String provider;
    String destination;
    Integer attemptCount;
    Integer maxAttempts;
    LocalDateTime lastAttemptAt;
    LocalDateTime nextRetryAt;
    String providerMessageId;
    String lastError;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
