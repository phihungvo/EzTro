package carevn.luv2code.ez_tro.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.BillingOperationLog;
import carevn.luv2code.ez_tro.enums.BillingAuditTargetType;

@Repository
public interface BillingOperationLogRepository extends JpaRepository<BillingOperationLog, Integer> {
    List<BillingOperationLog> findByContractIdOrderByCreatedAtDesc(Integer contractId);

    List<BillingOperationLog> findByTargetTypeAndTargetIdOrderByCreatedAtDesc(
            BillingAuditTargetType targetType, Integer targetId);

    List<BillingOperationLog> findByContractIdAndTargetTypeAndTargetIdOrderByCreatedAtDesc(
            Integer contractId, BillingAuditTargetType targetType, Integer targetId);
}
