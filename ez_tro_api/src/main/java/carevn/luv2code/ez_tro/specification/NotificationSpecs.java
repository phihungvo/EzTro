package carevn.luv2code.ez_tro.specification;

import org.springframework.data.jpa.domain.Specification;

import carevn.luv2code.ez_tro.entity.*;
import carevn.luv2code.ez_tro.enums.ContractStatus;
import jakarta.persistence.criteria.*;

public class NotificationSpecs {

    // Thông báo cá nhân gửi cho chính user đó
    public static Specification<Notification> personalTo(User user) {
        return (root, query, cb) -> cb.equal(root.get("recipient"), user);
    }

    // Thông báo broadcast (hệ thống) → mọi người đều thấy
    public static Specification<Notification> broadcast() {
        return (root, query, cb) -> cb.isTrue(root.get("isBroadcast"));
    }

    // Tất cả thông báo mà user này có quyền thấy
    public static Specification<Notification> visibleTo(User user) {
        return personalTo(user).or(broadcast());
    }

    // Thông báo của tất cả khách thuê thuộc chủ trọ này
    public static Specification<Notification> tenantsOfOwner(User owner) {
        return (root, query, cb) -> {
            query.distinct(true);
            Join<Notification, User> recipientJoin = root.join("recipient", JoinType.INNER);

            Subquery<Integer> subquery = query.subquery(Integer.class);
            Root<Tenant> tenantRoot = subquery.from(Tenant.class);
            Join<Tenant, Contract> contractJoin = tenantRoot.join("contracts", JoinType.INNER);
            Join<Contract, Room> roomJoin = contractJoin.join("room", JoinType.INNER);
            Join<Room, BoardingHouse> bhJoin = roomJoin.join("boardingHouse", JoinType.INNER);

            subquery.select(tenantRoot.get("user").get("id"))
                    .where(cb.and(
                            cb.equal(contractJoin.get("status"), ContractStatus.ACTIVE),
                            cb.equal(bhJoin.get("owner").get("id"), owner.getId())));

            return cb.in(recipientJoin.get("id")).value(subquery);
        };
    }

    //    public static Specification<Notification> visibleToOwner(User owner) {
    //        return tenantsOfOwner(owner).or(broadcast());
    //    }

    public static Specification<Notification> visibleToUser(User user) {
        return (root, query, cb) -> cb.or(cb.equal(root.get("recipient"), user), cb.isTrue(root.get("isBroadcast")));
    }

    public static Specification<Notification> visibleToOwner(User owner) {
        return (root, query, cb) -> {
            Subquery<User> subquery = query.subquery(User.class);
            Root<User> userRoot = subquery.from(User.class);
            Join<User, Tenant> tenant = userRoot.join("tenant", JoinType.INNER);
            Join<Tenant, Contract> contract = tenant.join("contracts", JoinType.INNER);
            Join<Contract, Room> room = contract.join("room", JoinType.INNER);
            Join<Room, BoardingHouse> bh = room.join("boardingHouse", JoinType.INNER);

            subquery.select(userRoot)
                    .where(cb.and(
                            cb.equal(bh.get("owner"), owner), cb.equal(contract.get("status"), ContractStatus.ACTIVE)));

            return cb.or(
                    cb.isTrue(root.get("isBroadcast")),
                    cb.equal(root.get("recipient"), owner),
                    root.get("recipient").in(subquery));
        };
    }

    public static Specification<Notification> visibleToAdmin(User admin) {
        return (root, query, cb) -> cb.or(cb.isTrue(root.get("isBroadcast")), cb.equal(root.get("recipient"), admin));
    }

    public static Specification<Notification> isUnread() {
        return (root, query, cb) -> cb.isFalse(root.get("isRead"));
    }
}
