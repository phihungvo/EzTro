package carevn.luv2code.ez_tro.specification;

import org.springframework.data.jpa.domain.Specification;

import carevn.luv2code.ez_tro.entity.User;

public class OwnerSpecs {

    public static Specification<User> hasRoleOwner() {
        return (root, query, cb) -> cb.equal(
                root.join("roles", jakarta.persistence.criteria.JoinType.INNER).get("name"), "OWNER");
    }

    public static Specification<User> isCurrentUser(User currentUser) {
        return (root, query, cb) -> {
            if (currentUser == null || currentUser.getId() == null) {
                return cb.disjunction();
            }
            return cb.equal(root.get("id"), currentUser.getId());
        };
    }
}
