package carevn.luv2code.ez_tro.dto.requests;

import lombok.Data;

@Data
public class OverrideLimitsRequest {
    private Integer overrideMaxBoardingHouses;
    private Integer overrideMaxBuildings;
    private Integer overrideMaxRooms;
}