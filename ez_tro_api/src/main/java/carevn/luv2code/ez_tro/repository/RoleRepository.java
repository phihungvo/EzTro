package carevn.luv2code.ez_tro.repository;

import java.util.Optional;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.Role;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {

    boolean existsByName(String name);

    Optional<Role> findByName(String name);

    @Query("SELECT r FROM Role r WHERE r.name = :name")
    Optional<Role> findByNameForUpdate(@Param("name") String name);

    //    Optional<Role> findByName(String name);
    //
    //    boolean existsByName(String name);

    @Query("SELECT r FROM Role r LEFT JOIN FETCH r.permissions WHERE r.name = :name")
    Optional<Role> findByNameWithPermissions(@Param("name") String name);

    @Query("SELECT r FROM Role r LEFT JOIN FETCH r.permissions WHERE r.id IN :roleIds")
    Set<Role> findByIdInWithPermissions(@Param("roleIds") Set<Long> roleIds);
}
