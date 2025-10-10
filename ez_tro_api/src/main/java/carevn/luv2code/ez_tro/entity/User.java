package carevn.luv2code.ez_tro.entity;

import java.util.*;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "users")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User implements UserDetails {
    @Id
    @GeneratedValue
    Integer id;

    @Column(name = "user_name", nullable = false)
    String userName;

    String firstName;

    String lastName;

    String fullName;

    @Column(unique = true, nullable = false)
    String email;

    @Column(nullable = false)
    String password;

    String address;

    String phoneNumber;

    String profilePicture;

    Date createAt;

    Date updateAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    Set<Role> roles;

    //    @ManyToMany(fetch = FetchType.EAGER)
    //    @JoinTable(
    //            name = "user_permissions",
    //            joinColumns = @JoinColumn(name = "user_id"),
    //            inverseJoinColumns = @JoinColumn(name = "permission_id"))
    //    Set<Permission> permissions;

    boolean enabled = true;

    boolean accountNonExpired = true;

    boolean credentialsNonExpired = true;

    boolean accountNonLocked = true;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<GrantedAuthority> authorities = new HashSet<>();
        if (roles != null) {
            roles.forEach(role -> {
                if (role.getPermissions() != null) {
                    role.getPermissions().forEach(permission -> {
                        authorities.add(new SimpleGrantedAuthority(permission.getName()));
                    });
                }
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));
            });
        }
        //        if (permissions != null) {
        //            permissions.forEach(permission -> {
        //                authorities.add(new SimpleGrantedAuthority(permission.getName()));
        //            });
        //        }
        return authorities;
    }

    @Override
    public String getUsername() {
        return userName;
    }

    @Override
    public boolean isAccountNonExpired() {
        return accountNonExpired;
    }

    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
