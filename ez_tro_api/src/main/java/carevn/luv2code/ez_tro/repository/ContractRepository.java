package carevn.luv2code.ez_tro.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.Room;
import carevn.luv2code.ez_tro.entity.Tenant;
import carevn.luv2code.ez_tro.enums.ContractStatus;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Integer> {
    List<Contract> findByTenant(Tenant tenant);

    List<Contract> findByRoom(Room room);

    List<Contract> findByRoomId(Integer roomId);

    List<Contract> findByTenantId(Integer tenantId);

    List<Contract> findByStatus(String status);

    @Query(
            "SELECT c FROM Contract c WHERE c.tenant.id = :tenantId AND c.status = carevn.luv2code.ez_tro.enums.ContractStatus.ACTIVE")
    Optional<Contract> findActiveContractByTenantId(Integer tenantId);

    @Query("SELECT c FROM Contract c WHERE c.tenant.user.id = :userId AND c.status = 'ACTIVE'")
    Optional<Contract> findActiveContractByTenantUserId(@Param("userId") Integer userId);

    @Query(
            """
		SELECT c FROM Contract c
		WHERE c.tenant.user.id = :userId
		AND c.status = :status
		AND c.startDate <= :today
		AND c.endDate >= :today
	""")
    Optional<Contract> findActiveContractByUserId(Integer userId, ContractStatus status, LocalDate today);
}
