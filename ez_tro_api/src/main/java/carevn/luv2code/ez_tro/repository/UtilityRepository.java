package carevn.luv2code.ez_tro.repository;

import java.util.List;
import java.util.Optional;

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

    List<Utility> findByBoardingHouseIdAndIsActiveTrue(Integer boardingHouseId);

    //    @Query("SELECT u FROM Utility u WHERE u.isActive = true")
    //    Page<Utility> findActive(Pageable pageable);

    Page<Utility> findByIsActiveTrue(Pageable pageable);

    @Query("SELECT u FROM Utility u WHERE u.boardingHouse.id = :boardingHouseId AND u.isActive = true")
    List<Utility> findAllByBoardingHouseId(Integer boardingHouseId);

    // === Tìm theo tên + boarding house (dùng để tính tiền điện nước) ===
    @Query(
            "SELECT u FROM Utility u WHERE u.name = :name AND u.boardingHouse.id = :boardingHouseId AND u.isActive = true")
    Optional<Utility> findByNameAndBoardingHouseId(
            @Param("name") String name, @Param("boardingHouseId") Integer boardingHouseId);

    // === Tìm active theo boarding house + phân trang ===
    Page<Utility> findByBoardingHouseIdAndIsActiveTrue(Integer boardingHouseId, Pageable pageable);

    @Query("SELECT u FROM Utility u WHERE u.boardingHouse.id = :boardingHouseId AND u.isActive = true")
    Page<Utility> findActiveByBoardingHouseId(@Param("boardingHouseId") Integer boardingHouseId, Pageable pageable);
}
