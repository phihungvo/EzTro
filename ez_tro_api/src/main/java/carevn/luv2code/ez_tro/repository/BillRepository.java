package carevn.luv2code.ez_tro.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT b FROM Bill b WHERE b.contract.id = :contractId " + "AND b.createdAt IS NOT NULL "
            + "AND function('YEAR', b.createdAt) = :year "
            + "AND function('MONTH', b.createdAt) = :month")
    Optional<Bill> findByContractAndMonthYear(
            @Param("contractId") Integer contractId, @Param("month") int month, @Param("year") int year);

    default Optional<Bill> findByContractAndMonthYear(Contract contract, int month, int year) {
        return findByContractAndMonthYear(contract.getId(), month, year);
    }
}
