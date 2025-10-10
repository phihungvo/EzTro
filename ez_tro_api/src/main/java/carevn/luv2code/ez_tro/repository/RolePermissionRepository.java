package carevn.luv2code.ez_tro.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.RolePermission;
import carevn.luv2code.ez_tro.entity.RolePermissionId;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, RolePermissionId> {
    List<RolePermission> findByRoleId(Integer roleId);

    List<RolePermission> findByPermissionId(Integer permissionId);

    @Modifying
    @Query("DELETE FROM RolePermission rp WHERE rp.role.id = :roleId")
    void deleteByRoleId(@Param("roleId") Integer roleId);

    @Modifying
    @Query("DELETE FROM RolePermission rp WHERE rp.permission.id = :permissionId")
    void deleteByPermissionId(@Param("permissionId") Integer permissionId);
}
