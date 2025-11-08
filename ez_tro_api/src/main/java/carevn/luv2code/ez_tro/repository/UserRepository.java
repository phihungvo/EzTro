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

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles r LEFT JOIN FETCH r.permissions WHERE u.userName = :userName")
    Optional<User> findByUserNameWithRolesAndPermissions(@Param("userName") String userName);

    Page<User> findByRolesContaining(Role role, Pageable pageable);

    //    Optional<User> findByIdAndIsOwner(Integer id, boolean isOwner);
    //
    //    List<User> findByIsOwner(boolean isOwner);
}
