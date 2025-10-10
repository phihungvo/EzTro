package carevn.luv2code.ez_tro.repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.Permission;
import carevn.luv2code.ez_tro.enums.HttpMethod;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Integer> {
    //    Optional<Permission> findByResourceAndAction(String resource, String action);

    Optional<Permission> findByName(String name);

    boolean existsByName(String name);

    List<Permission> findByApiEndpointAndHttpMethod(String apiEndpoint, HttpMethod httpMethod);

    @Query("SELECT p FROM Permission p WHERE p.apiEndpoint = :endpoint AND p.httpMethod = :method")
    Optional<Permission> findByEndpointAndMethod(
            @Param("endpoint") String endpoint, @Param("method") HttpMethod method);

    @Query("SELECT DISTINCT p FROM Permission p JOIN p.roles r JOIN r.users u WHERE u.userName = :username")
    Set<Permission> findPermissionsByUsername(@Param("username") String username);

    @Query("SELECT p FROM Permission p WHERE p.apiEndpoint LIKE :pattern OR p.resourcePattern LIKE :pattern")
    List<Permission> findByApiEndpointPattern(@Param("pattern") String pattern);

    @Query("SELECT DISTINCT p FROM Permission p "
            + "WHERE EXISTS (SELECT 1 FROM Role r JOIN r.permissions rp JOIN r.users u "
            + "WHERE rp = p AND u.userName = :username AND "
            + "(p.apiEndpoint = :endpoint OR p.resourcePattern = :pattern) AND "
            + "p.httpMethod = :method)")
    List<Permission> findUserPermissionsForEndpoint(
            @Param("username") String username,
            @Param("endpoint") String endpoint,
            @Param("pattern") String pattern,
            @Param("method") HttpMethod method);
}
