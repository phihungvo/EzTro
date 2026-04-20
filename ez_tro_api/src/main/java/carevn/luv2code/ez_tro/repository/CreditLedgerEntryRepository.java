package carevn.luv2code.ez_tro.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import carevn.luv2code.ez_tro.entity.CreditLedgerEntry;

public interface CreditLedgerEntryRepository extends JpaRepository<CreditLedgerEntry, Integer> {
    List<CreditLedgerEntry> findByContractIdOrderByCreatedAtAscIdAsc(Integer contractId);

    @Query("SELECT COALESCE(SUM(c.amount), 0) FROM CreditLedgerEntry c WHERE c.contract.id = :contractId")
    BigDecimal sumAmountByContractId(Integer contractId);

    @Query("SELECT COALESCE(SUM(c.amount), 0) FROM CreditLedgerEntry c WHERE c.payment.id = :paymentId")
    BigDecimal sumAmountByPaymentId(Integer paymentId);
}
