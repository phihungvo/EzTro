package carevn.luv2code.ez_tro.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerLimitsResponse {
    private Integer maxBoardingHouses;
    private Long currentBoardingHouses;
    private Integer maxBuildings;
    private Long currentBuildings;
    private Integer maxRooms;
    private Long currentRooms;
    private Integer maxTenants;
    private Long currentTenants;
    private Integer maxContracts;
    private Long currentContracts;
    private String planName;
    private String status;
}
