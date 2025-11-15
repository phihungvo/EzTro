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

    String title;

    String message;

    String type;

    Object data;

    boolean isRead;

    LocalDateTime createdAt;
}
