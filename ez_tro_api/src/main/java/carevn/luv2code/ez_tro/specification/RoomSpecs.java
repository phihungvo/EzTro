package carevn.luv2code.ez_tro.specification;

import org.springframework.data.jpa.domain.Specification;

import carevn.luv2code.ez_tro.entity.Room;
import carevn.luv2code.ez_tro.entity.User;

public class RoomSpecs {

    public static Specification<Room> ownedBy(User user) {
        return (root, query, cb) ->
                cb.equal(root.get("boardingHouse").get("owner").get("id"), user.getId());
    }

    public static Specification<Room> hasBoardingHouse() {
        return (root, query, cb) -> cb.isNotNull(root.get("boardingHouse"));
    }
}
