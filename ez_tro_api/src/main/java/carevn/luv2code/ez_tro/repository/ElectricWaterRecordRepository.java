package carevn.luv2code.ez_tro.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.ElectricWaterRecord;
import carevn.luv2code.ez_tro.entity.Room;

@Repository
public interface ElectricWaterRecordRepository extends JpaRepository<ElectricWaterRecord, Integer> {
    List<ElectricWaterRecord> findByRoom(Room room);

    List<ElectricWaterRecord> findByMonthAndYear(Integer month, Integer year);
}
