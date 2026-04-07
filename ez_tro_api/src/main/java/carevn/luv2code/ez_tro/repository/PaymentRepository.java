package carevn.luv2code.ez_tro.repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.Payment;
import carevn.luv2code.ez_tro.enums.PaymentStatus;
import jakarta.persistence.LockModeType;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer>, JpaSpecificationExecutor<Payment> {
    Optional<Payment> findByExternalReference(String externalReference);

    List<Payment> findByContractIdOrderByReceivedAtAsc(Integer contractId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Payment p WHERE p.id = :id")
    Optional<Payment> findByIdForUpdate(@Param("id") Integer id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Payment p WHERE p.contract.id = :contractId AND p.status IN :statuses "
            + "ORDER BY p.receivedAt ASC, p.id ASC")
    List<Payment> findByContractIdAndStatusInForUpdate(
            @Param("contractId") Integer contractId, @Param("statuses") Set<PaymentStatus> statuses);
}
