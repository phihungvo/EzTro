package carevn.luv2code.ez_tro.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import carevn.luv2code.ez_tro.entity.Room;
import carevn.luv2code.ez_tro.enums.RoomStatus;

public interface RoomRepository extends JpaRepository<Room, Integer> {
    List<Room> findAllByBoardingHouse_IdIn(List<Integer> boardingHouseIds);

    List<Room> findByBoardingHouseId(Integer boardingHouseId);

    List<Room> findByStatus(RoomStatus status);
}
