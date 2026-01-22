package carevn.luv2code.ez_tro.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.MeterReading;

@Repository
public interface MeterReadingRepository
        extends JpaRepository<MeterReading, Integer>, JpaSpecificationExecutor<MeterReading> {

    boolean existsByRoomIdAndUtilityIdAndPeriodMonthAndPeriodYear(
            Integer roomId, Integer utilityId, Integer month, Integer year);

    Optional<MeterReading> findByRoomIdAndUtilityIdAndPeriodMonthAndPeriodYear(
            Integer roomId, Integer utilityId, Integer month, Integer year);

    @Query("SELECT m FROM MeterReading m " + "WHERE m.room.id = :roomId "
            + "AND m.utility.id = :utilityId "
            + "AND (m.periodYear < :year OR (m.periodYear = :year AND m.periodMonth < :month)) "
            + "ORDER BY m.periodYear DESC, m.periodMonth DESC "
            + "LIMIT 1")
    Optional<MeterReading> findLatestPrevious(
            @Param("roomId") Integer roomId,
            @Param("utilityId") Integer utilityId,
            @Param("year") Integer year,
            @Param("month") Integer month);

    List<MeterReading> findByRoomIdAndPeriodMonthAndPeriodYear(Integer roomId, Integer month, Integer year);

    List<MeterReading> findByRoomId(Integer roomId);
}
