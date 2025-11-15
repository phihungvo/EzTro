package carevn.luv2code.ez_tro.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import carevn.luv2code.ez_tro.entity.Notification;
import carevn.luv2code.ez_tro.entity.User;

public interface NotificationRepository
        extends JpaRepository<Notification, Integer>, JpaSpecificationExecutor<Notification> {
    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(Integer recipientId, Pageable pageable);

    Integer countByRecipientIdAndIsReadFalse(Integer recipientId);

    Page<Notification> findByRecipientOrIsBroadcastIsTrue(User recipient, Pageable pageable);

    // Cho Owner: thấy của mình + của khách
    @Query(
            """
		SELECT n FROM Notification n
		WHERE n.isBroadcast = true
		OR n.recipient = :owner
		OR n.recipient IN (
			SELECT u FROM User u
			JOIN Tenant t ON t.user = u
			JOIN Contract c ON c.tenant = t AND c.status = 'ACTIVE'
			JOIN Room r ON c.room = r
			JOIN BoardingHouse bh ON r.boardingHouse = bh
			WHERE bh.owner = :owner
		)
		""")
    Page<Notification> findVisibleToOwner(@Param("owner") User owner, Pageable pageable);

    // CHO ADMIN: CHỈ THẤY BROADCAST + RIÊNG CHO ADMIN
    //    default Page<Notification> findVisibleToAdmin(User admin, Pageable pageable) {
    //        return findByIsBroadcastIsTrueOrRecipient(pageable);
    //    }

    // Method chính cho Admin
    Page<Notification> findByIsBroadcastIsTrueOrRecipient(User recipient, Pageable pageable);
}
