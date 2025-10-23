package carevn.luv2code.ez_tro.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import carevn.luv2code.ez_tro.entity.RoomAmenity;

public interface RoomAmenityRepository extends JpaRepository<RoomAmenity, Integer> {

    List<RoomAmenity> findAllByRoom_BoardingHouse_Id(Integer boardingHouseId);
}
