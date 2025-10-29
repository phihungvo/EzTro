package carevn.luv2code.ez_tro.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.Utility;

@Repository
public interface UtilityRepository extends JpaRepository<Utility, Integer> {

    List<Utility> findByBoardingHouseId(Integer boardingHouseId);

    @Query("SELECT u FROM Utility u WHERE u.isActive = true")
    Page<Utility> findActive(Pageable pageable);

    @Query("SELECT u FROM Utility u WHERE u.boardingHouse.id = :boardingHouseId AND u.isActive = true")
    Page<Utility> findActiveByBoardingHouseId(@Param("boardingHouseId") Integer boardingHouseId, Pageable pageable);
}
