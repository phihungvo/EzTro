package carevn.luv2code.ez_tro.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.UserRole;
import carevn.luv2code.ez_tro.entity.UserRoleId;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {
    List<UserRole> findByUserId(Integer userId);

    List<UserRole> findByRoleId(Integer roleId);

    @Modifying
    @Query("DELETE FROM UserRole ur WHERE ur.user.id = :userId")
    void deleteByUserId(@Param("userId") Integer userId);

    @Modifying
    @Query("DELETE FROM UserRole ur WHERE ur.role.id = :roleId")
    void deleteByRoleId(@Param("roleId") Integer roleId);
}
