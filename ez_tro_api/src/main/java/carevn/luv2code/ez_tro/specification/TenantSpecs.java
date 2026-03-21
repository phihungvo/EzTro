// src/main/java/carevn/luv2code/ez_tro/specification/TenantSpecs.java
package carevn.luv2code.ez_tro.specification;

import org.springframework.data.jpa.domain.Specification;

import carevn.luv2code.ez_tro.entity.*;
import carevn.luv2code.ez_tro.enums.ContractStatus;
import jakarta.persistence.criteria.*;

public class TenantSpecs {

    public static Specification<Tenant> ownedByOwner(User owner) {
        return (root, query, cb) -> {
            if (owner == null || owner.getId() == null) {
                return cb.disjunction();
            }
            return cb.equal(root.get("owner").get("id"), owner.getId());
        };
    }

    //    public static Specification<Tenant> ownedByOwner(User currentUser) {
    //        return (root, query, cb) -> {
    //            if (currentUser == null || currentUser.getId() == null) {
    //                return cb.disjunction();
    //            }
    //            query.distinct(true);
    //
    //            Join<Tenant, Contract> contractJoin =
    //                    root.join("contracts", JoinType.LEFT); // LEFT JOIN để giữ tenant không contract
    //            Join<Contract, Room> roomJoin = contractJoin.join("room", JoinType.LEFT);
    //            Join<Room, BoardingHouse> bhJoin = roomJoin.join("boardingHouse", JoinType.LEFT);
    //
    //            return cb.equal(bhJoin.get("owner").get("id"), currentUser.getId());
    //        };
    //    }

    public static Specification<Tenant> hasContract() {
        return (root, query, cb) -> root.join("contracts", JoinType.INNER).isNotNull();
    }

    public static Specification<Tenant> hasActiveContract() {
        return (root, query, cb) -> {
            Join<Tenant, Contract> join = root.join("contracts", JoinType.INNER);
            return cb.and(
                    cb.equal(join.get("status"), ContractStatus.ACTIVE),
                    cb.lessThanOrEqualTo(join.get("startDate"), new java.util.Date()),
                    cb.or(
                            cb.isNull(join.get("endDate")),
                            cb.greaterThanOrEqualTo(join.get("endDate"), new java.util.Date())));
        };
    }

    /**
     * Tenant có phòng
     */
    public static Specification<Tenant> hasRoom() {
        return (root, query, cb) -> {
            Join<Tenant, Contract> contractJoin = root.join("contracts", JoinType.INNER);
            return contractJoin.join("room", JoinType.INNER).isNotNull();
        };
    }
}
