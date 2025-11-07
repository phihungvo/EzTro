package carevn.luv2code.ez_tro.specification;

import org.springframework.data.jpa.domain.Specification;

import carevn.luv2code.ez_tro.entity.Building;
import carevn.luv2code.ez_tro.entity.User;

public class BuildingSpecs {

    public static Specification<Building> ownedBy(User owner) {
        return (root, query, cb) -> {
            if (owner == null) return cb.conjunction();
            return cb.equal(root.get("boardingHouse").get("owner").get("id"), owner.getId());
        };
    }

    public static Specification<Building> hasBoardingHouse() {
        return (root, query, cb) -> cb.isNotNull(root.get("boardingHouse"));
    }
}
