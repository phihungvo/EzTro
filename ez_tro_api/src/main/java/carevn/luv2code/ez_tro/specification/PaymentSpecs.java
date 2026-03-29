package carevn.luv2code.ez_tro.specification;

import java.time.*;
import java.util.Date;

import org.springframework.data.jpa.domain.Specification;

import carevn.luv2code.ez_tro.entity.*;
import carevn.luv2code.ez_tro.enums.PaymentSource;
import carevn.luv2code.ez_tro.enums.PaymentStatus;
import jakarta.persistence.criteria.*;

public final class PaymentSpecs {

    private PaymentSpecs() {}

    public static Specification<Payment> ownedByOwner(User owner) {
        return (root, query, cb) -> {
            if (owner == null) {
                return cb.conjunction();
            }
            query.distinct(true);
            Join<Payment, Contract> contractJoin = root.join("contract", JoinType.INNER);
            Join<Contract, Room> roomJoin = contractJoin.join("room", JoinType.INNER);
            Join<Room, BoardingHouse> boardingHouseJoin = roomJoin.join("boardingHouse", JoinType.INNER);
            return cb.equal(boardingHouseJoin.get("owner").get("id"), owner.getId());
        };
    }

    public static Specification<Payment> hasStatus(PaymentStatus status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    public static Specification<Payment> hasSource(PaymentSource source) {
        return (root, query, cb) -> source == null ? cb.conjunction() : cb.equal(root.get("source"), source);
    }

    public static Specification<Payment> hasContractId(Integer contractId) {
        return (root, query, cb) -> contractId == null
                ? cb.conjunction()
                : cb.equal(root.get("contract").get("id"), contractId);
    }

    public static Specification<Payment> receivedFrom(LocalDate fromDate) {
        return (root, query, cb) -> {
            if (fromDate == null) {
                return cb.conjunction();
            }
            Date from = toDate(fromDate.atStartOfDay());
            return cb.greaterThanOrEqualTo(root.get("receivedAt"), from);
        };
    }

    public static Specification<Payment> receivedTo(LocalDate toDate) {
        return (root, query, cb) -> {
            if (toDate == null) {
                return cb.conjunction();
            }
            Date to = toDate(toDate.atTime(LocalTime.MAX));
            return cb.lessThanOrEqualTo(root.get("receivedAt"), to);
        };
    }

    private static Date toDate(LocalDateTime dateTime) {
        return Date.from(dateTime.atZone(ZoneId.systemDefault()).toInstant());
    }
}
