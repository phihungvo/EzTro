package carevn.luv2code.ez_tro.service.admin;

import java.util.List;

import org.springframework.data.domain.Page;

import carevn.luv2code.ez_tro.dto.PermissionDTO;
import carevn.luv2code.ez_tro.dto.requests.CreatePermissionRequest;
import carevn.luv2code.ez_tro.entity.Permission;

public interface PermissionService {

    PermissionDTO createPermission(PermissionDTO permissionDTO);

    PermissionDTO updatePermission(Integer id, PermissionDTO permissionDTO);

    //    void deletePermission(UUID id);

    //    PermissionDTO getPermission(UUID id);

    //    List<Permission> getAllPermissions();
    //
    //    Permission getPermissionById(Integer id);
    //
    //    void deletePermission(Integer id);
    //
    //    Permission createPermission(String name, String description, String apiEndpoint, HttpMethod httpMethod);
    //
    Page<PermissionDTO> getAllPermissions(int page, int size);

    List<PermissionDTO> getAllPermissionsNoPaging();

    PermissionDTO createPermission(CreatePermissionRequest request);

    List<Permission> getUserPermissions(String username);

    public boolean hasPermissionForEndpoint(String username, String endpoint, String method);
}
