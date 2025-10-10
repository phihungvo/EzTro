package carevn.luv2code.ez_tro.entity;

import java.util.HashSet;
import java.util.Set;

import carevn.luv2code.ez_tro.enums.HttpMethod;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "permissions")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    String name;

    String description;

    String apiEndpoint;

    @Column(name = "http_method", nullable = false)
    @Enumerated(EnumType.STRING)
    HttpMethod httpMethod;

    String resourcePattern;

    @ManyToMany(mappedBy = "permissions")
    Set<Role> roles = new HashSet<>();
}
