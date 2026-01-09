package carevn.luv2code.ez_tro.repository;

import carevn.luv2code.ez_tro.entity.MeterReadingPeriod;
import carevn.luv2code.ez_tro.enums.PeriodStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MeterReadingPeriodRepository extends JpaRepository<MeterReadingPeriod, Integer> {
    Optional<MeterReadingPeriod> findByPeriodMonthAndPeriodYear(Integer month, Integer year);

    List<MeterReadingPeriod> findByStatus(PeriodStatus status);
}
