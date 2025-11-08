package carevn.luv2code.ez_tro.specification;

import java.sql.Date;

import org.springframework.data.jpa.domain.Specification;

import carevn.luv2code.ez_tro.entity.*;
import carevn.luv2code.ez_tro.enums.ContractStatus;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;

public class ContractSpecs {
    public static Specification<Contract> isActive() {
        return (root, query, cb) -> {
            Expression<Date> currentDate = cb.currentDate();
            return cb.and(
                    cb.equal(root.get("status"), ContractStatus.ACTIVE),
                    cb.lessThanOrEqualTo(root.get("startDate"), currentDate),
                    cb.or(root.get("endDate").isNull(), cb.greaterThanOrEqualTo(root.get("endDate"), currentDate)));
        };
    }

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
