package carevn.luv2code.ez_tro.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.ContractStateTransition;

@Repository
public interface ContractStateTransitionRepository extends JpaRepository<ContractStateTransition, Integer> {
    List<ContractStateTransition> findByContractIdOrderByChangedAtDesc(Integer contractId);
}
