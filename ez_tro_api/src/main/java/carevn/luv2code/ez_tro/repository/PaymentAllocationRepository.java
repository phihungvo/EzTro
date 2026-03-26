package carevn.luv2code.ez_tro.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.PaymentAllocation;

@Repository
public interface PaymentAllocationRepository extends JpaRepository<PaymentAllocation, Integer> {
    List<PaymentAllocation> findByPaymentIdOrderByCreatedAtAsc(Integer paymentId);

    List<PaymentAllocation> findByBillId(Integer billId);

    @Query("SELECT COALESCE(SUM(pa.amount), 0) FROM PaymentAllocation pa WHERE pa.payment.id = :paymentId")
    BigDecimal sumAllocatedByPaymentId(@Param("paymentId") Integer paymentId);

    @Query("SELECT COALESCE(SUM(pa.amount), 0) FROM PaymentAllocation pa WHERE pa.bill.id = :billId")
    BigDecimal sumAllocatedByBillId(@Param("billId") Integer billId);
}
