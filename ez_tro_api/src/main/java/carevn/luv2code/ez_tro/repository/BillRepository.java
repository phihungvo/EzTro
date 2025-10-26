package carevn.luv2code.ez_tro.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.Bill;
import carevn.luv2code.ez_tro.entity.Contract;

@Repository
public interface BillRepository extends JpaRepository<Bill, Integer> {
    List<Bill> findByContract(Contract contract);

    List<Bill> findByContractId(Integer contractId);

    List<Bill> findByTenantId(Integer tenantId);

    Page<Bill> findByTenant_User_Id(Integer userId, Pageable pageable);

    List<Bill> findByPaid(Boolean paid);

    Optional<Bill> findTopByContractOrderByCreatedAtDesc(Contract contract);
}
