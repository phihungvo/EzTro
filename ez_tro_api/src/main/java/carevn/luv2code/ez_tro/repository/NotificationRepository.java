package carevn.luv2code.ez_tro.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import carevn.luv2code.ez_tro.entity.Notification;
import carevn.luv2code.ez_tro.entity.NotificationEvent;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.NotificationReadStatus;

public interface NotificationRepository
        extends JpaRepository<Notification, Integer>, JpaSpecificationExecutor<Notification> {
    Page<Notification> findByRecipientAndArchivedAtIsNull(User recipient, Pageable pageable);

    long countByRecipientAndReadStatusAndArchivedAtIsNull(User recipient, NotificationReadStatus readStatus);

    java.util.List<Notification> findByRecipientAndReadStatusAndArchivedAtIsNull(
            User recipient, NotificationReadStatus readStatus);

    boolean existsByEventAndRecipient(NotificationEvent event, User recipient);
}
