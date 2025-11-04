package carevn.luv2code.ez_tro.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

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

    Optional<Contract> findTopByOrderByIdDesc();

    Optional<Contract> findByRoomIdAndStatus(Integer roomId, ContractStatus status);

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

    @Query("SELECT c FROM Contract c WHERE c.tenant.user.id = :userId AND c.status = 'ACTIVE'")
    Optional<Contract> findActiveContractByTenantUserId(@Param("userId") Integer userId);

    @Query(
            "SELECT c FROM Contract c WHERE c.tenant.user.id = :userId AND c.status = :status AND c.startDate <= :today AND (c.endDate IS NULL OR c.endDate >= :today)")
    Optional<Contract> findActiveContractByUserId(
            @Param("userId") Integer userId, @Param("status") ContractStatus status, @Param("today") LocalDate today);

    @Query("SELECT c FROM Contract c WHERE c.status = 'ACTIVE' "
            + "AND c.startDate <= :endOfMonth AND (c.endDate IS NULL OR c.endDate >= :startOfMonth)")
    List<Contract> findActiveContractsForBilling(
            @Param("startOfMonth") LocalDate startOfMonth, @Param("endOfMonth") LocalDate endOfMonth);

    default List<Contract> findActiveContractsForBilling(int month, int year) {
        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        LocalDate endOfMonth = startOfMonth.withDayOfMonth(startOfMonth.lengthOfMonth());
        return findActiveContractsForBilling(startOfMonth, endOfMonth);
    }
}
