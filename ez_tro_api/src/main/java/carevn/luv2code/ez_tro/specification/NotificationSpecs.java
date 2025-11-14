package carevn.luv2code.ez_tro.specification;

import org.springframework.data.jpa.domain.Specification;

import carevn.luv2code.ez_tro.entity.*;
import carevn.luv2code.ez_tro.enums.ContractStatus;
import jakarta.persistence.criteria.*;

public class NotificationSpecs {

    public static Specification<Notification> visibleToAll() {
        return (root, query, cb) -> cb.conjunction();
    }

    public static Specification<Notification> sentToUser(User user) {
        return (root, query, cb) -> {
            if (user == null || user.getId() == null) return cb.disjunction();
            return cb.equal(root.get("recipient").get("id"), user.getId());
        };
    }

    public static Specification<Notification> ownedByOwner(User owner) {
        return (root, query, cb) -> {
            if (owner == null || owner.getId() == null) return cb.disjunction();

            query.distinct(true);

            // Notification → recipient (User) → Tenant → Contract → Room → BoardingHouse → owner
            Join<Notification, User> userJoin = root.join("recipient", JoinType.INNER);
            Subquery<Integer> tenantSubquery = query.subquery(Integer.class);
            Root<Tenant> tenantRoot = tenantSubquery.from(Tenant.class);

            Join<Tenant, Contract> contractJoin = tenantRoot.join("contracts", JoinType.INNER);
            Join<Contract, Room> roomJoin = contractJoin.join("room", JoinType.INNER);
            Join<Room, BoardingHouse> bhJoin = roomJoin.join("boardingHouse", JoinType.INNER);

            tenantSubquery
                    .select(tenantRoot.get("user").get("id"))
                    .where(cb.and(
                            cb.equal(contractJoin.get("status"), ContractStatus.ACTIVE),
                            cb.equal(bhJoin.get("owner").get("id"), owner.getId())));

            return cb.in(userJoin.get("id")).value(tenantSubquery);
        };
    }

    public static Specification<Notification> isUnread() {
        return (root, query, cb) -> cb.equal(root.get("isRead"), false);
    }
}
