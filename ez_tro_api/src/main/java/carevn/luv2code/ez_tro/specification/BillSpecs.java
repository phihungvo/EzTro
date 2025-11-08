package carevn.luv2code.ez_tro.specification;

import org.springframework.data.jpa.domain.Specification;

import carevn.luv2code.ez_tro.entity.*;
import carevn.luv2code.ez_tro.enums.BillStatus;
import jakarta.persistence.criteria.*;

public class BillSpecs {

    public static Specification<Bill> ownedByOwner(User owner) {
        return (root, query, cb) -> {
            if (owner == null) return cb.conjunction();
            query.distinct(true);
            Join<Bill, Room> roomJoin = root.join("room", JoinType.INNER);
            Join<Room, BoardingHouse> bhJoin = roomJoin.join("boardingHouse", JoinType.INNER);
            return cb.equal(bhJoin.get("owner").get("id"), owner.getId());
        };
    }

    public static Specification<Bill> hasStatus(BillStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<Bill> hasPaid(Boolean paid) {
        return (root, query, cb) -> cb.equal(root.get("paid"), paid);
    }

    public static Specification<Bill> inMonthYear(Integer month, Integer year) {
        return (root, query, cb) -> {
            if (month == null || year == null) return cb.conjunction();
            Expression<Integer> monthExpr = cb.function("MONTH", Integer.class, root.get("createdAt"));
            Expression<Integer> yearExpr = cb.function("YEAR", Integer.class, root.get("createdAt"));
            return cb.and(cb.equal(monthExpr, month), cb.equal(yearExpr, year));
        };
    }
}
