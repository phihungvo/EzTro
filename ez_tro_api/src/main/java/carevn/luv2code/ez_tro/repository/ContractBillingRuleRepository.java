package carevn.luv2code.ez_tro.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.ContractBillingRule;

@Repository
public interface ContractBillingRuleRepository extends JpaRepository<ContractBillingRule, Integer> {
    /**
     * Truy vấn theo by contract id and is active true order by effective from desc.
     */
    List<ContractBillingRule> findByContractIdAndIsActiveTrueOrderByEffectiveFromDesc(Integer contractId);
    /**
     * Truy vấn theo by contract id and is active true and effective from less than equal.
     */
    List<ContractBillingRule> findByContractIdAndIsActiveTrueAndEffectiveFromLessThanEqual(
            Integer contractId, LocalDate asOfDate);
}
