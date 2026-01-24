package carevn.luv2code.ez_tro.dto;

//public class SubscriptionPlanDTO {
//}
//package carevn.luv2code.ez_tro.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlanDTO {
    private Integer id;
    private String code;
    private String name;
    private String description;
    private Integer maxBoardingHouses;
    private Integer maxBuildings;
    private Integer maxRooms;
    private BigDecimal pricePerMonth;
    private Integer durationDays;
    private Boolean isActive;
}