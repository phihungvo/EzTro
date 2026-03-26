package carevn.luv2code.ez_tro.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.BillLine;

@Repository
public interface BillLineRepository extends JpaRepository<BillLine, Integer> {
    List<BillLine> findByBillIdOrderByIdAsc(Integer billId);

    boolean existsByBillIdAndLineKey(Integer billId, String lineKey);

    Optional<BillLine> findByBillIdAndLineKey(Integer billId, String lineKey);

    void deleteByBillId(Integer billId);
}
