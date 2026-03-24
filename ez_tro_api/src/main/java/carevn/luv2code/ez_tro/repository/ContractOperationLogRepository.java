package carevn.luv2code.ez_tro.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.ContractOperationLog;
import carevn.luv2code.ez_tro.enums.ContractOperationType;

@Repository
public interface ContractOperationLogRepository extends JpaRepository<ContractOperationLog, Integer> {
    Optional<ContractOperationLog> findByContractIdAndOperationTypeAndIdempotencyKey(
            Integer contractId, ContractOperationType operationType, String idempotencyKey);
}
