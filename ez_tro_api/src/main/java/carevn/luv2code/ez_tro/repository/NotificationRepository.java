package carevn.luv2code.ez_tro.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import carevn.luv2code.ez_tro.entity.Notification;

public interface NotificationRepository
        extends JpaRepository<Notification, Integer>, JpaSpecificationExecutor<Notification> {
    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(Integer recipientId, Pageable pageable);

    Integer countByRecipientIdAndIsReadFalse(Integer recipientId);
}
