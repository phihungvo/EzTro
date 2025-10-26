package carevn.luv2code.ez_tro.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.Amenity;

@Repository
public interface AmenityRepository extends JpaRepository<Amenity, Integer> {
    List<Amenity> findAllByBoardingHouse_Id(Integer boardingHouseId);

    boolean existsByNameAndBoardingHouse_Id(String name, Integer boardingHouseId);

    List<Amenity> findByBoardingHouseIdAndIsActiveTrue(Integer boardingHouseId);
}
