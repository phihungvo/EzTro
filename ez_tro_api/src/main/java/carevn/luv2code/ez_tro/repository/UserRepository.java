package carevn.luv2code.ez_tro.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.Role;
import carevn.luv2code.ez_tro.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Integer>, JpaSpecificationExecutor<User> {

    Optional<User> findByUserName(String userName);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Page<User> findAll(Pageable pageable);

    //    Optional<User> findByUserName(String userName);

    //    Optional<User> findByEmail(String email);

    boolean existsByUserName(String userName);

    @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE r.name = 'OWNER'")
    List<User> findAllOwners();

    @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE r.name = 'ADMIN'")
    List<User> findAllAdmins();

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles r LEFT JOIN FETCH r.permissions WHERE u.userName = :userName")
    Optional<User> findByUserNameWithRolesAndPermissions(@Param("userName") String userName);

    /**
     * Lấy danh sách User (khách thuê) đang thuê phòng ACTIVE thuộc chủ trọ có ID = ownerId
     */
    @Query(
            """
			SELECT DISTINCT u FROM User u
			INNER JOIN Tenant t ON t.user = u
			INNER JOIN Contract c ON c.tenant = t
			INNER JOIN Room r ON c.room = r
			INNER JOIN BoardingHouse bh ON r.boardingHouse = bh
			WHERE bh.owner.id = :ownerId
			AND c.status = 'ACTIVE'
			""")
    List<User> findActiveTenantsByOwnerId(@Param("ownerId") Integer ownerId);

    @Query(
            """
			SELECT DISTINCT u FROM User u
			INNER JOIN Tenant t ON t.user = u
			INNER JOIN Contract c ON c.tenant = t
			INNER JOIN Room r ON c.room = r
			WHERE r.boardingHouse.id IN :boardingHouseIds
			AND c.status = 'ACTIVE'
			""")
    List<User> findActiveTenantsByBoardingHouseIds(@Param("boardingHouseIds") List<Integer> boardingHouseIds);

    @Query(
            """
			SELECT DISTINCT u FROM User u
			INNER JOIN Tenant t ON t.user = u
			INNER JOIN Contract c ON c.tenant = t
			INNER JOIN Room r ON c.room = r
			INNER JOIN BoardingHouse bh ON r.boardingHouse = bh
			WHERE r.boardingHouse.id IN :boardingHouseIds
			AND bh.owner.id = :ownerId
			AND c.status = 'ACTIVE'
			""")
    List<User> findActiveTenantsByBoardingHouseIdsAndOwnerId(
            @Param("boardingHouseIds") List<Integer> boardingHouseIds, @Param("ownerId") Integer ownerId);

    @Query(
            """
			SELECT DISTINCT u FROM User u
			INNER JOIN Tenant t ON t.user = u
			INNER JOIN Contract c ON c.tenant = t
			INNER JOIN Room r ON c.room = r
			WHERE r.building.id IN :buildingIds
			AND c.status = 'ACTIVE'
			""")
    List<User> findActiveTenantsByBuildingIds(@Param("buildingIds") List<Integer> buildingIds);

    @Query(
            """
			SELECT DISTINCT u FROM User u
			INNER JOIN Tenant t ON t.user = u
			INNER JOIN Contract c ON c.tenant = t
			INNER JOIN Room r ON c.room = r
			INNER JOIN BoardingHouse bh ON r.boardingHouse = bh
			WHERE r.building.id IN :buildingIds
			AND bh.owner.id = :ownerId
			AND c.status = 'ACTIVE'
			""")
    List<User> findActiveTenantsByBuildingIdsAndOwnerId(
            @Param("buildingIds") List<Integer> buildingIds, @Param("ownerId") Integer ownerId);

    @Query(
            """
			SELECT DISTINCT u FROM User u
			INNER JOIN Tenant t ON t.user = u
			INNER JOIN Contract c ON c.tenant = t
			INNER JOIN Room r ON c.room = r
			WHERE r.id IN :roomIds
			AND c.status = 'ACTIVE'
			""")
    List<User> findActiveTenantsByRoomIds(@Param("roomIds") List<Integer> roomIds);

    @Query(
            """
			SELECT DISTINCT u FROM User u
			INNER JOIN Tenant t ON t.user = u
			INNER JOIN Contract c ON c.tenant = t
			INNER JOIN Room r ON c.room = r
			INNER JOIN BoardingHouse bh ON r.boardingHouse = bh
			WHERE r.id IN :roomIds
			AND bh.owner.id = :ownerId
			AND c.status = 'ACTIVE'
			""")
    List<User> findActiveTenantsByRoomIdsAndOwnerId(
            @Param("roomIds") List<Integer> roomIds, @Param("ownerId") Integer ownerId);

    @Query(
            """
			SELECT DISTINCT u FROM User u
			INNER JOIN Tenant t ON t.user = u
			INNER JOIN Contract c ON c.tenant = t
			WHERE t.id IN :tenantIds
			AND c.status = 'ACTIVE'
			""")
    List<User> findActiveTenantsByTenantIds(@Param("tenantIds") List<Integer> tenantIds);

    @Query(
            """
			SELECT DISTINCT u FROM User u
			INNER JOIN Tenant t ON t.user = u
			INNER JOIN Contract c ON c.tenant = t
			WHERE t.id IN :tenantIds
			AND t.owner.id = :ownerId
			AND c.status = 'ACTIVE'
			""")
    List<User> findActiveTenantsByTenantIdsAndOwnerId(
            @Param("tenantIds") List<Integer> tenantIds, @Param("ownerId") Integer ownerId);

    Page<User> findByRolesContaining(Role role, Pageable pageable);

    //    Optional<User> findByIdAndIsOwner(Integer id, boolean isOwner);
    //
    //    List<User> findByIsOwner(boolean isOwner);
}
