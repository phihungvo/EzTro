package carevn.luv2code.ez_tro.mapper;

import org.springframework.stereotype.Component;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;

import carevn.luv2code.ez_tro.dto.response.NotificationResponse;
import carevn.luv2code.ez_tro.entity.Notification;
import carevn.luv2code.ez_tro.enums.NotificationChannel;
import carevn.luv2code.ez_tro.enums.NotificationReadStatus;

@Component
public class NotificationMapper {

    private final Gson gson = new Gson();

    public NotificationResponse toResponse(Notification entity) {
        if (entity == null) {
            return null;
        }

        NotificationReadStatus readStatus = entity.getReadStatus() != null
                ? entity.getReadStatus()
                : Boolean.TRUE.equals(entity.getIsRead()) ? NotificationReadStatus.READ : NotificationReadStatus.UNREAD;

        return NotificationResponse.builder()
                .id(entity.getId())
                .eventId(entity.getEvent() != null ? entity.getEvent().getId() : null)
                .title(entity.getTitle())
                .message(entity.getMessage())
                .type(entity.getType())
                .eventKey(entity.getEventKey() != null ? entity.getEventKey() : entity.getType())
                .category(entity.getCategory() != null ? entity.getCategory().name() : null)
                .priority(entity.getPriority() != null ? entity.getPriority().name() : null)
                .channel(entity.getChannel() != null ? entity.getChannel().name() : NotificationChannel.IN_APP.name())
                .actionUrl(entity.getActionUrl())
                .actionLabel(entity.getActionLabel())
                .recipientRole(entity.getRecipientRole())
                .data(deserialize(entity.getData()))
                .read(readStatus == NotificationReadStatus.READ)
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private Object deserialize(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            return gson.fromJson(json, Object.class);
        } catch (JsonSyntaxException ex) {
            return json;
        }
    }
}
