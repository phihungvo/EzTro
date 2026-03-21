package carevn.luv2code.ez_tro.dto.requests;

import java.math.BigDecimal;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubscriptionPlanCreateRequest {
    @NotBlank(message = "Code không được để trống")
    private String code;

    @NotBlank(message = "Tên gói không được để trống")
    private String name;

    private String description;

    private String fullDescription; // Lưu Markdown

    @NotNull
    @Min(0)
    private Integer maxBoardingHouses;

    @NotNull
    @Min(0)
    private Integer maxBuildings;

    @NotNull
    @Min(0)
    private Integer maxRooms;

    private Integer maxTenants;

    private Integer maxActiveContracts;

    private BigDecimal pricePerMonth;

    private Integer durationDays;
}
