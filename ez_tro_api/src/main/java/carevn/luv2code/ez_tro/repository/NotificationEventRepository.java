package carevn.luv2code.ez_tro.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import carevn.luv2code.ez_tro.entity.NotificationEvent;

public interface NotificationEventRepository extends JpaRepository<NotificationEvent, Integer> {
    Optional<NotificationEvent> findTopByDedupeKeyOrderByCreatedAtDesc(String dedupeKey);
}
