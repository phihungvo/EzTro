package carevn.luv2code.ez_tro.specification;

import org.springframework.data.jpa.domain.Specification;

import carevn.luv2code.ez_tro.entity.PropertyAsset;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.PropertyAssetCategory;
import carevn.luv2code.ez_tro.enums.PropertyAssetCondition;
import carevn.luv2code.ez_tro.enums.PropertyAssetStatus;

public final class PropertyAssetSpecs {

    private PropertyAssetSpecs() {}

    public static Specification<PropertyAsset> notDeleted() {
        return (root, query, cb) -> cb.isFalse(root.get("isDeleted"));
    }

    public static Specification<PropertyAsset> ownedBy(User user) {
        return (root, query, cb) ->
                cb.equal(root.get("boardingHouse").get("owner").get("id"), user.getId());
    }

    public static Specification<PropertyAsset> boardingHouseId(Integer boardingHouseId) {
        return (root, query, cb) -> boardingHouseId == null
                ? cb.conjunction()
                : cb.equal(root.get("boardingHouse").get("id"), boardingHouseId);
    }

    public static Specification<PropertyAsset> roomId(Integer roomId) {
        return (root, query, cb) ->
                roomId == null ? cb.conjunction() : cb.equal(root.get("room").get("id"), roomId);
    }

    public static Specification<PropertyAsset> category(PropertyAssetCategory category) {
        return (root, query, cb) -> category == null ? cb.conjunction() : cb.equal(root.get("category"), category);
    }

    public static Specification<PropertyAsset> status(PropertyAssetStatus status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    public static Specification<PropertyAsset> condition(PropertyAssetCondition condition) {
        return (root, query, cb) -> condition == null ? cb.conjunction() : cb.equal(root.get("condition"), condition);
    }

    public static Specification<PropertyAsset> search(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return cb.conjunction();
            }

            String pattern = "%" + search.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("assetCode")), pattern),
                    cb.like(cb.lower(root.get("assetName")), pattern),
                    cb.like(cb.lower(root.get("serialNumber")), pattern),
                    cb.like(cb.lower(root.get("assignedTo")), pattern),
                    cb.like(cb.lower(root.get("brand")), pattern),
                    cb.like(cb.lower(root.get("model")), pattern));
        };
    }
}
