package carevn.luv2code.ez_tro.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import carevn.luv2code.ez_tro.entity.NotificationPreference;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.NotificationChannel;

public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Integer> {
    List<NotificationPreference> findByUser(User user);

    Optional<NotificationPreference> findByUserAndEventKeyAndChannel(
            User user, String eventKey, NotificationChannel channel);
}
