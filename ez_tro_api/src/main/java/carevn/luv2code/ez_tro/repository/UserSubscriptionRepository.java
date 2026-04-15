package carevn.luv2code.ez_tro.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import carevn.luv2code.ez_tro.entity.UserSubscription;
import carevn.luv2code.ez_tro.enums.SubscriptionStatus;

public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Long> {

    @Query(
            """
				SELECT us
				FROM UserSubscription us
				WHERE us.owner.id = :ownerId
				AND us.status = :status
				AND (us.endDate IS NULL OR us.endDate >= CURRENT_TIMESTAMP)
				ORDER BY us.startDate DESC
			""")
    Optional<UserSubscription> findActiveByOwnerId(Integer ownerId, SubscriptionStatus status);

    @Query(
            """
			SELECT us
			FROM UserSubscription us
			WHERE us.status = :status
			AND (us.endDate IS NULL OR us.endDate >= CURRENT_TIMESTAMP)
			ORDER BY us.startDate DESC
			""")
    List<UserSubscription> findAllActive(@Param("status") SubscriptionStatus status);

    @Query(
            """
			SELECT us
			FROM UserSubscription us
			WHERE us.status = :status
			AND us.endDate IS NOT NULL
			AND us.endDate < CURRENT_TIMESTAMP
			ORDER BY us.endDate DESC
			""")
    List<UserSubscription> findAllExpiredButStillActive(@Param("status") SubscriptionStatus status);

    @Query(
            """
			SELECT us
			FROM UserSubscription us
			WHERE us.status = :status
			AND us.endDate IS NOT NULL
			AND us.endDate BETWEEN :from AND :to
			ORDER BY us.endDate ASC
			""")
    List<UserSubscription> findAllExpiringBetween(
            @Param("status") SubscriptionStatus status,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);
}
