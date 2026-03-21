package carevn.luv2code.ez_tro.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSubscriptionDTO {
    private Long id;
    private Integer ownerId;
    private String ownerName;
    private Integer planId;
    private String planCode;
    private String planName;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String status;
    private Integer overrideMaxBoardingHouses;
    private Integer overrideMaxBuildings;
    private Integer overrideMaxRooms;
    private LocalDateTime createdAt;
}
