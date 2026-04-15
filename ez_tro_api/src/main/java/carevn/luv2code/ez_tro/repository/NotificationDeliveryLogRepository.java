package carevn.luv2code.ez_tro.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import carevn.luv2code.ez_tro.entity.NotificationDeliveryLog;
import carevn.luv2code.ez_tro.entity.NotificationEvent;

public interface NotificationDeliveryLogRepository
        extends JpaRepository<NotificationDeliveryLog, Integer>, JpaSpecificationExecutor<NotificationDeliveryLog> {
    List<NotificationDeliveryLog> findByEvent(NotificationEvent event);
}
