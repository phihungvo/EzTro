package carevn.luv2code.ez_tro.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.PaymentOperationLog;
import carevn.luv2code.ez_tro.enums.PaymentOperationType;

@Repository
public interface PaymentOperationLogRepository extends JpaRepository<PaymentOperationLog, Integer> {
    Optional<PaymentOperationLog> findByTargetKeyAndOperationTypeAndIdempotencyKey(
            String targetKey, PaymentOperationType operationType, String idempotencyKey);
}
