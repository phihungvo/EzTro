package carevn.luv2code.ez_tro.service;

import org.springframework.data.domain.Page;

import carevn.luv2code.ez_tro.dto.UserDTO;
import carevn.luv2code.ez_tro.dto.requests.AssignRoleRequest;
import carevn.luv2code.ez_tro.dto.requests.CreateUserRequest;
import carevn.luv2code.ez_tro.dto.requests.UserUpdateRequest;

public interface UserService {

    //    User findByUsername(String username);

    //    void save(UserDTO userDTO);

    UserDTO createUser(CreateUserRequest request);

    UserDTO assignRoles(AssignRoleRequest request);

    UserDTO updateUser(Integer id, UserUpdateRequest request);

    //    void updateUser(UUID userId, UserUpdateRequest request);

    Page<UserDTO> findAll(int page, int size);

    //    void deleteUser(UUID userId);

    //    void assignPermissions(UUID userId, List<String> permissionNames);

    //    void removePermission(UUID userId, String resource, String action);

    //    List<String> getUserPermissions(UUID userId);

    //    List<Permission> getAllPermissions();
}
