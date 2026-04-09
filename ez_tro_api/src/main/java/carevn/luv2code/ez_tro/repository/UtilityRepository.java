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

    List<Utility> findByOwner_Id(Integer ownerId);

    Page<Utility> findByOwner_Id(Integer ownerId, Pageable pageable);

    @Query(
            """
			SELECT DISTINCT u FROM Utility u
			LEFT JOIN u.boardingHouses bh
			WHERE u.owner.id = :ownerId
			AND (bh.id = :boardingHouseId OR bh IS NULL)
			""")
    List<Utility> findByOwnerAndBoardingHouse(
            @Param("ownerId") Integer ownerId, @Param("boardingHouseId") Integer boardingHouseId);

    @Query(
            """
			SELECT DISTINCT u FROM Utility u
			LEFT JOIN u.boardingHouses bh
			WHERE u.owner.id = :ownerId
			AND (bh.id = :boardingHouseId OR bh IS NULL)
			AND u.isActive = true
			""")
    List<Utility> findByOwnerAndBoardingHouseActive(
            @Param("ownerId") Integer ownerId, @Param("boardingHouseId") Integer boardingHouseId);

    //    @Query("SELECT u FROM Utility u WHERE u.isActive = true")
    //    Page<Utility> findActive(Pageable pageable);

    Page<Utility> findByIsActiveTrue(Pageable pageable);

    @Query(
            """
			SELECT DISTINCT u FROM Utility u
			LEFT JOIN u.boardingHouses bh
			WHERE (bh.id = :boardingHouseId OR bh IS NULL)
			AND u.isActive = true
			""")
    List<Utility> findAllByBoardingHouseId(Integer boardingHouseId);

    // === Tìm theo tên + boarding house (dùng để tính tiền điện nước) ===
    @Query(
            """
			SELECT DISTINCT u FROM Utility u
			LEFT JOIN u.boardingHouses bh
			WHERE u.name = :name
			AND (bh.id = :boardingHouseId OR bh IS NULL)
			AND u.isActive = true
			""")
    Optional<Utility> findByNameAndBoardingHouseId(
            @Param("name") String name, @Param("boardingHouseId") Integer boardingHouseId);

    // === Tìm active theo boarding house + phân trang ===
    @Query(
            """
			SELECT DISTINCT u FROM Utility u
			LEFT JOIN u.boardingHouses bh
			WHERE (bh.id = :boardingHouseId OR bh IS NULL)
			AND u.isActive = true
			""")
    Page<Utility> findByBoardingHouseIdAndIsActiveTrue(Integer boardingHouseId, Pageable pageable);

    @Query(
            """
			SELECT DISTINCT u FROM Utility u
			LEFT JOIN u.boardingHouses bh
			WHERE (bh.id = :boardingHouseId OR bh IS NULL)
			AND u.isActive = true
			""")
    Page<Utility> findActiveByBoardingHouseId(@Param("boardingHouseId") Integer boardingHouseId, Pageable pageable);
}
