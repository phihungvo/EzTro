package carevn.luv2code.ez_tro.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.ElectricWaterRecord;
import carevn.luv2code.ez_tro.entity.Room;

@Repository
public interface ElectricWaterRecordRepository extends JpaRepository<ElectricWaterRecord, Integer> {
    List<ElectricWaterRecord> findByRoom(Room room);

    List<ElectricWaterRecord> findByMonthAndYear(Integer month, Integer year);

    @Query("SELECT e FROM ElectricWaterRecord e WHERE e.room.id = :roomId AND e.month = :month AND e.year = :year")
    Optional<ElectricWaterRecord> findByRoomAndMonthYear(
            @Param("roomId") Integer roomId, @Param("month") int month, @Param("year") int year);

    default Optional<ElectricWaterRecord> findByRoomAndMonthYear(Room room, int month, int year) {
        return findByRoomAndMonthYear(room.getId(), month, year);
    }
}
