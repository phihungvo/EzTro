package carevn.luv2code.ez_tro.specification;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

import org.springframework.data.jpa.domain.Specification;

import carevn.luv2code.ez_tro.entity.NotificationDeliveryLog;
import carevn.luv2code.ez_tro.entity.NotificationEvent;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.NotificationChannel;
import carevn.luv2code.ez_tro.enums.NotificationDeliveryStatus;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;

public final class NotificationDeliveryLogSpecs {

    private NotificationDeliveryLogSpecs() {}

    public static Specification<NotificationDeliveryLog> actorScope(User currentUser, boolean isAdmin) {
        return (root, query, cb) -> {
            if (currentUser == null || isAdmin) {
                return cb.conjunction();
            }
            Join<NotificationDeliveryLog, NotificationEvent> eventJoin = root.join("event", JoinType.LEFT);
            Join<NotificationEvent, User> actorJoin = eventJoin.join("actorUser", JoinType.LEFT);
            return cb.equal(actorJoin.get("id"), currentUser.getId());
        };
    }

    public static Specification<NotificationDeliveryLog> channel(String rawChannel) {
        NotificationChannel channel = parseChannel(rawChannel);
        return (root, query, cb) -> channel == null ? cb.conjunction() : cb.equal(root.get("channel"), channel);
    }

    public static Specification<NotificationDeliveryLog> status(String rawStatus) {
        NotificationDeliveryStatus status = parseStatus(rawStatus);
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    public static Specification<NotificationDeliveryLog> eventId(Integer eventId) {
        return (root, query, cb) ->
                eventId == null ? cb.conjunction() : cb.equal(root.join("event").get("id"), eventId);
    }

    public static Specification<NotificationDeliveryLog> keyword(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return (root, query, cb) -> cb.conjunction();
        }

        String normalized = "%" + keyword.trim().toLowerCase(Locale.ROOT) + "%";
        return (root, query, cb) -> {
            Join<NotificationDeliveryLog, NotificationEvent> eventJoin = root.join("event", JoinType.LEFT);
            Join<NotificationDeliveryLog, User> recipientJoin = root.join("recipient", JoinType.LEFT);
            return cb.or(
                    cb.like(cb.lower(root.get("title")), normalized),
                    cb.like(cb.lower(root.get("message")), normalized),
                    cb.like(cb.lower(root.get("destination")), normalized),
                    cb.like(cb.lower(eventJoin.get("eventKey")), normalized),
                    cb.like(cb.lower(recipientJoin.get("fullName")), normalized),
                    cb.like(cb.lower(recipientJoin.get("email")), normalized),
                    cb.like(cb.lower(recipientJoin.get("phoneNumber")), normalized));
        };
    }

    public static Specification<NotificationDeliveryLog> pendingForProcessing(
            List<NotificationDeliveryStatus> statuses, LocalDateTime dueAt) {
        return (root, query, cb) -> cb.and(
                root.get("status").in(statuses),
                cb.lessThanOrEqualTo(root.get("nextRetryAt"), dueAt),
                cb.lessThan(root.get("attemptCount"), root.get("maxAttempts")));
    }

    private static NotificationChannel parseChannel(String rawChannel) {
        if (rawChannel == null || rawChannel.isBlank()) {
            return null;
        }
        try {
            return NotificationChannel.valueOf(rawChannel.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private static NotificationDeliveryStatus parseStatus(String rawStatus) {
        if (rawStatus == null || rawStatus.isBlank()) {
            return null;
        }
        try {
            return NotificationDeliveryStatus.valueOf(rawStatus.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
