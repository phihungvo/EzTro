package carevn.luv2code.ez_tro.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.MeterReadingPeriod;
import carevn.luv2code.ez_tro.enums.PeriodStatus;

@Repository
public interface MeterReadingPeriodRepository extends JpaRepository<MeterReadingPeriod, Integer> {
    Optional<MeterReadingPeriod> findByPeriodMonthAndPeriodYear(Integer month, Integer year);

    List<MeterReadingPeriod> findByStatus(PeriodStatus status);
}
