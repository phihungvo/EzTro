package carevn.luv2code.ez_tro.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.Tenant;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Integer>, JpaSpecificationExecutor<Tenant> {
    Optional<Tenant> findByUserId(Integer userId);

    // Đếm tenant qua hợp đồng và phòng
    @Query("SELECT COUNT(t) FROM Tenant t " + "WHERE t IN (SELECT c.tenant FROM Contract c "
            + "WHERE c.room.boardingHouse.owner.id = :ownerId)")
    long countByOwnerId(@Param("ownerId") Integer ownerId);

    @Query(
            """
						SELECT t FROM Tenant t
						LEFT JOIN FETCH t.user u
						LEFT JOIN FETCH u.profilePicture
						LEFT JOIN FETCH t.contracts c
						WHERE t.id = :id
					""")
    Optional<Tenant> findByIdWithDetails(@Param("id") Integer id);

    //	@Query("SELECT t FROM Tenant t LEFT JOIN FETCH t.contracts WHERE t.id = :id")
    //	Optional<Tenant> findByIdWithDetails(@Param("id") Integer id);
}
