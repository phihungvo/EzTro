package carevn.luv2code.ez_tro.service.admin;

import java.util.List;

import org.springframework.data.domain.Page;

import carevn.luv2code.ez_tro.dto.RoleDTO;
import carevn.luv2code.ez_tro.dto.requests.AssignPermissionRequest;
import carevn.luv2code.ez_tro.dto.requests.CreateRoleRequest;
import carevn.luv2code.ez_tro.dto.requests.UpdateRoleRequest;

public interface RoleService {
    //    RoleDTO createRole(RoleDTO roleDTO);

    RoleDTO createRole(CreateRoleRequest request);

    RoleDTO assignPermissions(AssignPermissionRequest request);

    RoleDTO updateRole(Integer id, UpdateRoleRequest request);

    //    RoleDTO updateRole(UUID id, RoleDTO roleDTO);
    //
    //    void deleteRole(UUID id);
    //
    //    RoleDTO getRole(UUID id);
    //
    Page<RoleDTO> getAllRoles(int page, int size);

    List<RoleDTO> getAllRolesNoPaging();

    //    void assignPermissionsToRole(UUID roleId, List<UUID> permissionIds);
    //
    //    void removePermissionFromRole(UUID roleId, UUID permissionId);
}
