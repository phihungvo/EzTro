package carevn.luv2code.ez_tro.repository;

import carevn.luv2code.ez_tro.entity.UserSubscription;
import carevn.luv2code.ez_tro.enums.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Long> {

    @Query("""
                SELECT us
                FROM UserSubscription us
                WHERE us.owner.id = :ownerId
                  AND us.status = :status
                  AND (us.endDate IS NULL OR us.endDate >= CURRENT_TIMESTAMP)
                ORDER BY us.startDate DESC
            """)
    Optional<UserSubscription> findActiveByOwnerId(
            Integer ownerId,
            SubscriptionStatus status
    );


}