package carevn.luv2code.ez_tro.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import carevn.luv2code.ez_tro.entity.Room;
import carevn.luv2code.ez_tro.enums.RoomStatus;

public interface RoomRepository extends JpaRepository<Room, Integer> {
    List<Room> findAllByBoardingHouse_IdIn(List<Integer> boardingHouseIds);

    List<Room> findByBoardingHouseId(Integer boardingHouseId);

    List<Room> findByStatus(RoomStatus status);

    @Query("SELECT MAX(CAST(r.roomNumber AS int)) FROM Room r WHERE r.building.id = :buildingId")
    Integer findMaxRoomNumberByBuildingId(@Param("buildingId") Integer buildingId);

    boolean existsByBuildingIdAndRoomNumber(Integer buildingId, String roomNumber);
}
