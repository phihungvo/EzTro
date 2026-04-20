package carevn.luv2code.ez_tro.repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.Bill;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.enums.BillLifecycleStatus;
import carevn.luv2code.ez_tro.enums.BillStatus;
import jakarta.persistence.LockModeType;

@Repository
public interface BillRepository extends JpaRepository<Bill, Integer>, JpaSpecificationExecutor<Bill> {

    List<Bill> findByContract(Contract contract);

    List<Bill> findByContractId(Integer contractId);

    List<Bill> findByTenantId(Integer tenantId);

    Page<Bill> findByTenant_User_Id(Integer userId, Pageable pageable);

    @Query(
            """
			SELECT b
			FROM Bill b
			WHERE b.tenant.user.id = :userId
			AND (
					b.lifecycleStatus = :sentStatus
					OR (b.lifecycleStatus = :cancelledStatus AND b.sentAt IS NOT NULL)
				)
			ORDER BY b.createdAt DESC, b.id DESC
			""")
    List<Bill> findVisibleToTenantByUserId(
            @Param("userId") Integer userId,
            @Param("sentStatus") BillLifecycleStatus sentStatus,
            @Param("cancelledStatus") BillLifecycleStatus cancelledStatus);

    @Query(
            value =
                    """
					SELECT b
					FROM Bill b
					WHERE b.tenant.user.id = :userId
					AND (
							b.lifecycleStatus = :sentStatus
							OR (b.lifecycleStatus = :cancelledStatus AND b.sentAt IS NOT NULL)
						)
					""",
            countQuery =
                    """
					SELECT COUNT(b)
					FROM Bill b
					WHERE b.tenant.user.id = :userId
					AND (
							b.lifecycleStatus = :sentStatus
							OR (b.lifecycleStatus = :cancelledStatus AND b.sentAt IS NOT NULL)
						)
					""")
    Page<Bill> findVisibleToTenantByUserId(
            @Param("userId") Integer userId,
            @Param("sentStatus") BillLifecycleStatus sentStatus,
            @Param("cancelledStatus") BillLifecycleStatus cancelledStatus,
            Pageable pageable);

    Optional<Bill> findTopByContractOrderByCreatedAtDesc(Contract contract);

    boolean existsByGenerationKey(String generationKey);

    Optional<Bill> findByGenerationKey(String generationKey);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Bill b WHERE b.id IN :ids ORDER BY b.id ASC")
    List<Bill> findByIdInForUpdate(@Param("ids") Collection<Integer> ids);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Bill b WHERE b.contract.id = :contractId " + "ORDER BY b.dueDate ASC, b.id ASC")
    List<Bill> findByContractIdForUpdate(@Param("contractId") Integer contractId);

    List<Bill> findByStatusNotAndDueDateBefore(BillStatus status, LocalDate dueDate);

    // Kiểm tra tồn tại bill trong tháng/năm chỉ định
    //    @Query("SELECT COUNT(b) > 0 FROM Bill b " + "WHERE b.room.id = :roomId "
    //            + "AND YEAR(b.dueDate) = :year "
    //            + "AND MONTH(b.dueDate) = :month")
    //    boolean existsByRoomIdAndMonthAndYear(
    //            @Param("roomId") Integer roomId, @Param("month") int month, @Param("year") int year);

    // Tìm bill trong kỳ (mới nhất trước)
    @Query(
            value =
                    """
								SELECT * FROM bills b
								WHERE b.room_id = :roomId
								AND EXTRACT(YEAR FROM b.due_date) = :year
								AND EXTRACT(MONTH FROM b.due_date) = :month
								ORDER BY b.created_at DESC
								LIMIT 10
							""",
            nativeQuery = true)
    List<Bill> findByRoomAndPeriod(
            @Param("roomId") Integer roomId, @Param("month") Integer month, @Param("year") Integer year);

    // Tìm bill gần nhất trước tháng/năm chỉ định (lấy chỉ số cũ) helloooooo
    @Query("SELECT b FROM Bill b " + "WHERE b.room.id = :roomId "
            + "AND b.dueDate < :endOfPeriod "
            + "ORDER BY b.dueDate DESC")
    Optional<Bill> findTopByRoomIdAndDueDateBeforeOrderByDueDateDesc(
            @Param("roomId") Integer roomId, @Param("endOfPeriod") LocalDate endOfPeriod);

    //    @Query(
    //            """
    //                    	SELECT b FROM Bill b
    //                    	WHERE b.room.id = :roomId
    //                    	AND FUNCTION('MONTH', b.dueDate) = :month
    //                    	AND FUNCTION('YEAR', b.dueDate) = :year
    //                    	ORDER BY b.createdAt DESC
    //                    """)
    //    List<Bill> findByRoomAndPeriod(
    //            @Param("roomId") Integer roomId, @Param("month") Integer month, @Param("year") Integer year);

    // Tìm tất cả bill của một phòng, sắp xếp mới nhất trước
    //    List<Bill> findByRoomIdOrderByYearDescMonthDesc(Integer roomId);

    // Đếm số bill trong tháng/năm cụ thể của phòng
    @Query(
            value =
                    """
				SELECT COUNT(*)
				FROM bills b
				WHERE b.room_id = :roomId
				AND EXTRACT(YEAR FROM b.due_date) = :year
				AND EXTRACT(MONTH FROM b.due_date) = :month
			""",
            nativeQuery = true)
    Long countByRoomIdAndMonthAndYear(
            @Param("roomId") Integer roomId, @Param("month") Integer month, @Param("year") Integer year);

    default boolean existsByRoomIdAndMonthAndYear(Integer roomId, Integer month, Integer year) {
        return countByRoomIdAndMonthAndYear(roomId, month, year) > 0;
    }

    List<Bill> findByStatusInAndDueDate(List<BillStatus> statuses, LocalDate dueDate);

    @Query(
            value =
                    """
					SELECT SUM(b.amount - COALESCE(pa.sumAllocated,0))
					FROM bills b
					JOIN contracts c ON b.contract_id = c.id
					JOIN rooms r ON c.room_id = r.id
					JOIN boarding_houses bh ON r.boarding_house_id = bh.id
					LEFT JOIN (
						SELECT bill_id, SUM(amount) AS sumAllocated
						FROM payment_allocations
						GROUP BY bill_id
					) pa ON pa.bill_id = b.id
					WHERE bh.owner_id = :ownerId
					AND (:boardingHouseId IS NULL OR bh.id = :boardingHouseId)
					AND b.due_date >= :start AND b.due_date < :end
					AND b.status <> 'CANCELLED'
					""",
            nativeQuery = true)
    java.math.BigDecimal sumOutstandingByOwnerAndRange(
            @Param("ownerId") Integer ownerId,
            @Param("boardingHouseId") Integer boardingHouseId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    @Query(
            value =
                    """
					SELECT SUM(b.amount - COALESCE(pa.sumAllocated,0))
					FROM bills b
					JOIN contracts c ON b.contract_id = c.id
					JOIN rooms r ON c.room_id = r.id
					JOIN boarding_houses bh ON r.boarding_house_id = bh.id
					LEFT JOIN (
						SELECT bill_id, SUM(amount) AS sumAllocated
						FROM payment_allocations
						GROUP BY bill_id
					) pa ON pa.bill_id = b.id
					WHERE bh.owner_id = :ownerId
					AND (:boardingHouseId IS NULL OR bh.id = :boardingHouseId)
					AND b.due_date >= :start AND b.due_date < :end
					AND b.status = 'OVERDUE'
					""",
            nativeQuery = true)
    java.math.BigDecimal sumOverdueByOwnerAndRange(
            @Param("ownerId") Integer ownerId,
            @Param("boardingHouseId") Integer boardingHouseId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    @Query(
            value =
                    """
					SELECT COUNT(*)
					FROM bills b
					JOIN contracts c ON b.contract_id = c.id
					JOIN rooms r ON c.room_id = r.id
					JOIN boarding_houses bh ON r.boarding_house_id = bh.id
					WHERE bh.owner_id = :ownerId
					AND (:boardingHouseId IS NULL OR bh.id = :boardingHouseId)
					AND b.due_date >= :start AND b.due_date < :end
					AND b.status = 'OVERDUE'
					""",
            nativeQuery = true)
    long countOverdueBillsByOwnerAndRange(
            @Param("ownerId") Integer ownerId,
            @Param("boardingHouseId") Integer boardingHouseId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    List<Bill> findByStatus(BillStatus status);

    // Tìm bill theo contract và tháng/năm (nếu cần)
    //    @Query("SELECT b FROM Bill b WHERE b.contract.id = :contractId " + "AND b.month = :month AND b.year = :year")
    //    Optional<Bill> findByContractAndMonthYear(
    //            @Param("contractId") Integer contractId, @Param("month") int month, @Param("year") int year);

    //    default Optional<Bill> findByContractAndMonthYear(Contract contract, int month, int year) {
    //        return findByContractAndMonthYear(contract.getId(), month, year);
    //    }
}
