package carevn.luv2code.ez_tro.specification;

import org.springframework.data.jpa.domain.Specification;

import carevn.luv2code.ez_tro.entity.*;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;

public class ContractSpecs {

    public static Specification<Contract> ownedByOwner(User currentUser) {
        return (root, query, cb) -> {
            if (currentUser == null || currentUser.getId() == null) {
                return cb.disjunction();
            }
            query.distinct(true);
            Join<Contract, Room> roomJoin = root.join("room", JoinType.INNER);
            Join<Room, BoardingHouse> bhJoin = roomJoin.join("boardingHouse", JoinType.INNER);
            return cb.equal(bhJoin.get("owner").get("id"), currentUser.getId());
        };
    }
}
