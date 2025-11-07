package carevn.luv2code.ez_tro.specification;

import org.springframework.data.jpa.domain.Specification;

import carevn.luv2code.ez_tro.entity.BoardingHouse;
import carevn.luv2code.ez_tro.entity.User;

public class BoardingHouseSpecs {

    public static Specification<BoardingHouse> ownedBy(User user) {
        return (root, query, cb) -> cb.equal(root.get("owner").get("id"), user.getId());
    }
}
