package carevn.luv2code.ez_tro.controller.admin;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.SubscriptionPlanDTO;
import carevn.luv2code.ez_tro.dto.UserSubscriptionDTO;
import carevn.luv2code.ez_tro.dto.requests.*;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.OwnerLimitsResponse;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.SubscriptionPlanService;
import carevn.luv2code.ez_tro.service.admin.UserSubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionPlanService planService;
    private final UserSubscriptionService subService;

    // ------------------- Subscription Plans (Admin only) -------------------

    @PostMapping("/plans")
    public ApiResponse<SubscriptionPlanDTO> createPlan(@Valid @RequestBody SubscriptionPlanCreateRequest request) {
        return ApiResponse.<SubscriptionPlanDTO>builder()
                .code(HttpStatus.CREATED.value())
                .message("Subscription plan created successfully")
                .result(planService.create(request))
                .build();
    }

    @GetMapping("/plans")
    public ApiResponse<List<SubscriptionPlanDTO>> getAllPlans() {
        return ApiResponse.<List<SubscriptionPlanDTO>>builder()
                .code(HttpStatus.CREATED.value())
                .message("")
                .result(planService.getAllActive())
                .build();
    }

    @GetMapping("/plans/{id}")
    public ApiResponse<SubscriptionPlanDTO> getPlan(@PathVariable Integer id) {
        return ApiResponse.<SubscriptionPlanDTO>builder()
                .code(HttpStatus.CREATED.value())
                .message("Get subscription plan successfully")
                .result(planService.getById(id))
                .build();
    }

    @PutMapping("/plans/{id}")
    public ApiResponse<SubscriptionPlanDTO> updatePlan(
            @PathVariable Integer id, @Valid @RequestBody SubscriptionPlanCreateRequest request) {
        return ApiResponse.<SubscriptionPlanDTO>builder()
                .code(HttpStatus.OK.value())
                .message("Subscription plan updated successfully")
                .result(planService.update(id, request))
                .build();
    }

    @DeleteMapping("/plans/{id}")
    public ApiResponse<Void> deletePlan(@PathVariable Integer id) {
        planService.delete(id);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Subscription plan deleted successfully")
                .result(null)
                .build();
    }

    // ------------------- User Subscriptions -------------------

    @PostMapping("/assign")
    public ApiResponse<UserSubscriptionDTO> assignSubscription(@Valid @RequestBody AssignSubscriptionRequest request) {
        return ApiResponse.<UserSubscriptionDTO>builder()
                .code(HttpStatus.OK.value())
                .message("Subscription assigned successfully")
                .result(subService.assignSubscription(request))
                .build();
    }

    @PatchMapping("/{subscriptionId}/override")
    public ApiResponse<UserSubscriptionDTO> overrideLimits(
            @PathVariable Long subscriptionId, @RequestBody OverrideLimitsRequest request) {
        return ApiResponse.<UserSubscriptionDTO>builder()
                .code(HttpStatus.OK.value())
                .message("Subscription limits overridden successfully")
                .result(subService.overrideLimits(subscriptionId, request))
                .build();
    }

    // ------------------- Owner xem giới hạn của chính mình -------------------

    @GetMapping("/my-limits")
    public ApiResponse<OwnerLimitsResponse> getMyLimits() {
        Integer currentUserId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.<OwnerLimitsResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get current user's limits successfully")
                .result(subService.getCurrentLimits(currentUserId))
                .build();
    }

    // Admin xem limits của bất kỳ owner nào
    @GetMapping("/owner/{ownerId}/limits")
    public ApiResponse<OwnerLimitsResponse> getOwnerLimits(@PathVariable Integer ownerId) {
        return ApiResponse.<OwnerLimitsResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get owner's limits successfully")
                .result(subService.getCurrentLimits(ownerId))
                .build();
    }
}
