package carevn.luv2code.ez_tro.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.ContractAmendment;

@Repository
public interface ContractAmendmentRepository extends JpaRepository<ContractAmendment, Integer> {
    List<ContractAmendment> findByContractIdOrderByEffectiveFromDesc(Integer contractId);

    List<ContractAmendment> findByContractIdAndEffectiveFromLessThanEqual(Integer contractId, LocalDate asOfDate);
}
