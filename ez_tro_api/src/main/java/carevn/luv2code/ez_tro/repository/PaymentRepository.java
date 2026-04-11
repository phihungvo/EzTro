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

    @Query(
            value =
                    """
					SELECT DATE(p.received_at) AS bucketDate, SUM(p.amount) AS totalAmount
					FROM payments p
					JOIN contracts c ON p.contract_id = c.id
					JOIN rooms r ON c.room_id = r.id
					JOIN boarding_houses bh ON r.boarding_house_id = bh.id
					WHERE bh.owner_id = :ownerId
					AND p.status IN ('CONFIRMED','PARTIALLY_ALLOCATED','FULLY_ALLOCATED','OVERPAID')
					AND (:boardingHouseId IS NULL OR bh.id = :boardingHouseId)
					AND p.received_at >= :start
					AND p.received_at < :end
					GROUP BY DATE(p.received_at)
					ORDER BY bucketDate ASC
					""",
            nativeQuery = true)
    List<carevn.luv2code.ez_tro.repository.projection.RevenueBucket> sumRevenueByDay(
            @Param("ownerId") Integer ownerId,
            @Param("boardingHouseId") Integer boardingHouseId,
            @Param("start") java.time.LocalDateTime start,
            @Param("end") java.time.LocalDateTime end);
}
