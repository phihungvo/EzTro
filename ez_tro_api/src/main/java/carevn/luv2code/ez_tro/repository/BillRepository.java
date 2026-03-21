package carevn.luv2code.ez_tro.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.Bill;
import carevn.luv2code.ez_tro.entity.Contract;

@Repository
public interface BillRepository extends JpaRepository<Bill, Integer>, JpaSpecificationExecutor<Bill> {

    List<Bill> findByContract(Contract contract);

    List<Bill> findByContractId(Integer contractId);

    List<Bill> findByTenantId(Integer tenantId);

    Page<Bill> findByTenant_User_Id(Integer userId, Pageable pageable);

    Optional<Bill> findTopByContractOrderByCreatedAtDesc(Contract contract);

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

    // Tìm bill gần nhất trước tháng/năm chỉ định (lấy chỉ số cũ)
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

    // Tìm bill theo contract và tháng/năm (nếu cần)
    //    @Query("SELECT b FROM Bill b WHERE b.contract.id = :contractId " + "AND b.month = :month AND b.year = :year")
    //    Optional<Bill> findByContractAndMonthYear(
    //            @Param("contractId") Integer contractId, @Param("month") int month, @Param("year") int year);

    //    default Optional<Bill> findByContractAndMonthYear(Contract contract, int month, int year) {
    //        return findByContractAndMonthYear(contract.getId(), month, year);
    //    }
}
