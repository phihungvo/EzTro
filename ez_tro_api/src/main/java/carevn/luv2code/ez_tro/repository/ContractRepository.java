package carevn.luv2code.ez_tro.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.Room;
import carevn.luv2code.ez_tro.entity.Tenant;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Integer> {
    List<Contract> findByTenant(Tenant tenant);

    List<Contract> findByRoom(Room room);

    List<Contract> findByRoomId(Integer roomId);

    List<Contract> findByTenantId(Integer tenantId);

    List<Contract> findByStatus(String status);
}
