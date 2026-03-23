package carevn.luv2code.ez_tro.repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.Room;
import carevn.luv2code.ez_tro.entity.Tenant;
import carevn.luv2code.ez_tro.enums.ContractStatus;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Integer>, JpaSpecificationExecutor<Contract> {
    List<Contract> findByTenant(Tenant tenant);

    List<Contract> findByRoom(Room room);

    List<Contract> findByRoomId(Integer roomId);

    List<Contract> findByTenantId(Integer tenantId);

    List<Contract> findByStatus(String status);

    boolean existsByRoomIdAndStatus(Integer roomId, ContractStatus status);

    boolean existsByRoomIdAndStatusIn(Integer roomId, Collection<ContractStatus> statuses);

    boolean existsByRoomIdAndIdNotAndStatusIn(Integer roomId, Integer id, Collection<ContractStatus> statuses);

    Optional<Contract> findTopByOrderByIdDesc();

    Optional<Contract> findByRoomIdAndStatus(Integer roomId, ContractStatus status);

    // Đếm số hợp đồng theo ownerId và status
    @Query("SELECT COUNT(c) FROM Contract c WHERE c.room.boardingHouse.owner.id = :ownerId AND c.status = :status")
    long countByOwnerIdAndStatus(@Param("ownerId") Integer ownerId, @Param("status") ContractStatus status);

    @Query(
            """
		SELECT c FROM Contract c
		WHERE c.status = :status
		AND c.startDate <= :today
		AND c.endDate >= :today
	""")
    List<Contract> findAllActiveContracts(ContractStatus status, LocalDate today);

    @Query("SELECT c FROM Contract c WHERE c.tenant.id = :tenantId AND c.status = 'ACTIVE'")
    Optional<Contract> findActiveContractByTenantId(@Param("tenantId") Integer tenantId);

    // === Tìm hợp đồng active theo tenant user ID ===
    @Query(
            """
		SELECT c FROM Contract c
		WHERE c.tenant.user.id = :userId
		AND c.status = 'ACTIVE'
		AND c.startDate <= :today
		AND (c.endDate IS NULL OR c.endDate >= :today)
		""")
    Optional<Contract> findActiveContractByTenantUserId(
            @Param("userId") Integer userId, @Param("today") LocalDate today);

    //    @Query("SELECT c FROM Contract c WHERE c.tenant.user.id = :userId AND c.status = 'ACTIVE'")
    //    Optional<Contract> findActiveContractByTenantUserId(@Param("userId") Integer userId);

    @Query(
            "SELECT c FROM Contract c WHERE c.tenant.user.id = :userId AND c.status = :status AND c.startDate <= :today AND (c.endDate IS NULL OR c.endDate >= :today)")
    Optional<Contract> findActiveContractByUserId(
            @Param("userId") Integer userId, @Param("status") ContractStatus status, @Param("today") LocalDate today);

    // === Tìm tất cả hợp đồng active để lập hóa đơn tháng ===
    @Query("SELECT c FROM Contract c WHERE c.status = 'ACTIVE' "
            + "AND c.startDate <= :endOfMonth AND (c.endDate IS NULL OR c.endDate >= :startOfMonth)")
    List<Contract> findActiveContractsForBilling(
            @Param("startOfMonth") LocalDate startOfMonth, @Param("endOfMonth") LocalDate endOfMonth);

    @Query(
            """
			SELECT c
			FROM Contract c
			WHERE c.status <> carevn.luv2code.ez_tro.enums.ContractStatus.CANCELLED
			AND (
					(c.status = carevn.luv2code.ez_tro.enums.ContractStatus.PENDING
					AND c.endDate IS NOT NULL
					AND c.endDate < :today)
				OR (c.status = carevn.luv2code.ez_tro.enums.ContractStatus.PENDING
					AND c.startDate <= :today)
				OR (c.status = carevn.luv2code.ez_tro.enums.ContractStatus.EXPIRED
					AND c.startDate > :today)
				OR (c.status = carevn.luv2code.ez_tro.enums.ContractStatus.EXPIRED
					AND c.startDate <= :today
					AND (c.endDate IS NULL OR c.endDate >= :today))
				OR
					(c.status = carevn.luv2code.ez_tro.enums.ContractStatus.ACTIVE
					AND c.endDate IS NOT NULL
					AND c.endDate < :today)
			)
			ORDER BY c.id ASC
			""")
    List<Contract> findContractsNeedingStatusSync(@Param("today") LocalDate today, Pageable pageable);

    @Query(
            """
			SELECT COUNT(c) > 0
			FROM Contract c
			WHERE c.room.id = :roomId
			AND c.status = carevn.luv2code.ez_tro.enums.ContractStatus.ACTIVE
			AND c.startDate <= :today
			AND (c.endDate IS NULL OR c.endDate >= :today)
			""")
    boolean existsEffectiveActiveContractByRoomId(@Param("roomId") Integer roomId, @Param("today") LocalDate today);

    default List<Contract> findActiveContractsForBilling(int month, int year) {
        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        LocalDate endOfMonth = startOfMonth.withDayOfMonth(startOfMonth.lengthOfMonth());
        return findActiveContractsForBilling(startOfMonth, endOfMonth);
    }
}
