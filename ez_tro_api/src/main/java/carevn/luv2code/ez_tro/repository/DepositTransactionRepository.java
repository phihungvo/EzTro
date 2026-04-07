package carevn.luv2code.ez_tro.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.DepositTransaction;

@Repository
public interface DepositTransactionRepository extends JpaRepository<DepositTransaction, Integer> {
    List<DepositTransaction> findByContractIdOrderByOccurredAtDesc(Integer contractId);
}
