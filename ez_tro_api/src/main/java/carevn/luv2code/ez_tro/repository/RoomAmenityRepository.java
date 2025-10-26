package carevn.luv2code.ez_tro.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.RoomAmenity;
import carevn.luv2code.ez_tro.entity.RoomAmenityId;

@Repository
public interface RoomAmenityRepository extends JpaRepository<RoomAmenity, RoomAmenityId> {

    List<RoomAmenity> findAllByRoom_BoardingHouse_Id(Integer boardingHouseId);

    @Query("SELECT ra FROM RoomAmenity ra WHERE ra.room.id = :roomId " + "AND ra.startDate <= :endOfMonth "
            + "AND (ra.endDate IS NULL OR ra.endDate >= :startOfMonth)")
    List<RoomAmenity> findActiveByRoomId(
            @Param("roomId") Integer roomId,
            @Param("startOfMonth") LocalDate startOfMonth,
            @Param("endOfMonth") LocalDate endOfMonth);

    default List<RoomAmenity> findActiveByRoomId(Integer roomId, int month, int year) {
        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        LocalDate endOfMonth = startOfMonth.withDayOfMonth(startOfMonth.lengthOfMonth());
        return findActiveByRoomId(roomId, startOfMonth, endOfMonth);
    }
}
