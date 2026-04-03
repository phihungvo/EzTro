package carevn.luv2code.ez_tro.specification;

import org.springframework.data.jpa.domain.Specification;

import carevn.luv2code.ez_tro.entity.Notification;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.NotificationCategory;
import carevn.luv2code.ez_tro.enums.NotificationInboxStatus;
import carevn.luv2code.ez_tro.enums.NotificationReadStatus;

public final class NotificationInboxSpecs {

    private NotificationInboxSpecs() {}

    public static Specification<Notification> recipient(User user) {
        return (root, query, cb) -> cb.equal(root.get("recipient"), user);
    }

    public static Specification<Notification> inboxStatus(NotificationInboxStatus status) {
        NotificationInboxStatus effectiveStatus = status != null ? status : NotificationInboxStatus.ALL;

        return switch (effectiveStatus) {
            case ARCHIVED -> (root, query, cb) -> cb.isNotNull(root.get("archivedAt"));
            case READ -> (root, query, cb) -> cb.and(
                    cb.isNull(root.get("archivedAt")),
                    cb.or(
                            cb.equal(root.get("readStatus"), NotificationReadStatus.READ),
                            cb.and(cb.isNull(root.get("readStatus")), cb.isTrue(root.get("isRead")))));
            case UNREAD -> (root, query, cb) -> cb.and(
                    cb.isNull(root.get("archivedAt")),
                    cb.or(
                            cb.equal(root.get("readStatus"), NotificationReadStatus.UNREAD),
                            cb.and(cb.isNull(root.get("readStatus")), cb.isFalse(root.get("isRead")))));
            case ALL -> (root, query, cb) -> cb.isNull(root.get("archivedAt"));
        };
    }

    public static Specification<Notification> category(NotificationCategory category) {
        if (category == null) {
            return Specification.where(null);
        }
        return (root, query, cb) -> cb.equal(root.get("category"), category);
    }

    public static Specification<Notification> keyword(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return Specification.where(null);
        }
        String pattern = "%" + keyword.trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("title")), pattern),
                cb.like(cb.lower(root.get("message")), pattern),
                cb.like(cb.lower(root.get("eventKey")), pattern));
    }
}
