package carevn.luv2code.ez_tro.configuration.seed;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubscriptionPlanSeedData {

    private List<PlanSeed> plans = new ArrayList<>();

    @Getter
    @Setter
    public static class PlanSeed {
        private String code;
        private String name;
        private String description;
        private String fullDescription;
        private Integer maxBoardingHouses;
        private Integer maxBuildings;
        private Integer maxRooms;
        private Integer maxTenants;
        private Integer maxActiveContracts;
        private BigDecimal pricePerMonth;
        private Integer durationDays;
        private Boolean isActive;
    }
}
