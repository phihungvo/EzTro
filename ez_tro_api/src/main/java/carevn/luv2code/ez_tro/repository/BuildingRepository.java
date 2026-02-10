package carevn.luv2code.ez_tro.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.Building;

@Repository
public interface BuildingRepository extends JpaRepository<Building, Integer>, JpaSpecificationExecutor<Building> {
    List<Building> findByBoardingHouseId(Integer boardingHouseId);

    //    @Query("SELECT COUNT(b) FROM Building b WHERE b.boardingHouse.owner.id = :ownerId")
    //    long countByBoardingHouse_Owner_Id(@Param("ownerId") Integer ownerId);

    long countByBoardingHouse_Owner_Id(Integer ownerId);
}
