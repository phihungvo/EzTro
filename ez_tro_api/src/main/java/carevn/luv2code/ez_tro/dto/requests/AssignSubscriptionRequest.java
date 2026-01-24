package carevn.luv2code.ez_tro.dto.requests;

import carevn.luv2code.ez_tro.enums.SubscriptionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AssignSubscriptionRequest {
    @NotNull(message = "Owner ID không được để trống")
    private Integer ownerId;

    @NotNull(message = "Plan ID không được để trống")
    private Integer planId;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDateTime startDate;

    private LocalDateTime endDate;
    private SubscriptionStatus status;
}