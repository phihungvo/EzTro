package carevn.luv2code.ez_tro.specification;

import org.springframework.data.jpa.domain.Specification;

import carevn.luv2code.ez_tro.entity.MeterReading;
import carevn.luv2code.ez_tro.entity.User;

public class ElectricWaterRecordSpecs {

    public static Specification<MeterReading> ownedByOwner(User owner) {
        return (root, query, cb) -> {
            query.distinct(true);
            return cb.equal(root.get("room").get("boardingHouse").get("owner").get("id"), owner.getId());
        };
    }

    public static Specification<MeterReading> inMonthYear(Integer month, Integer year) {
        return (root, query, cb) -> {
            if (month == null && year == null) return cb.conjunction();
            if (month != null && year != null) {
                return cb.and(cb.equal(root.get("month"), month), cb.equal(root.get("year"), year));
            }
            if (month != null) return cb.equal(root.get("month"), month);
            return cb.equal(root.get("year"), year);
        };
    }

    public static Specification<MeterReading> hasRoom(Integer roomId) {
        return (root, query, cb) -> cb.equal(root.get("room").get("id"), roomId);
    }
}
