package carevn.luv2code.ez_tro.controller.admin;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.SubscriptionPlanDTO;
import carevn.luv2code.ez_tro.dto.UserSubscriptionDTO;
import carevn.luv2code.ez_tro.dto.requests.*;
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
    public ResponseEntity<SubscriptionPlanDTO> createPlan(@Valid @RequestBody SubscriptionPlanCreateRequest request) {
        return ResponseEntity.ok(planService.create(request));
    }

    @GetMapping("/plans")
    public ResponseEntity<List<SubscriptionPlanDTO>> getAllPlans() {
        return ResponseEntity.ok(planService.getAllActive());
    }

    @GetMapping("/plans/{id}")
    public ResponseEntity<SubscriptionPlanDTO> getPlan(@PathVariable Integer id) {
        return ResponseEntity.ok(planService.getById(id));
    }

    @PutMapping("/plans/{id}")
    public ResponseEntity<SubscriptionPlanDTO> updatePlan(
            @PathVariable Integer id, @Valid @RequestBody SubscriptionPlanCreateRequest request) {
        return ResponseEntity.ok(planService.update(id, request));
    }

    @DeleteMapping("/plans/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable Integer id) {
        planService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ------------------- User Subscriptions -------------------

    @PostMapping("/assign")
    public ResponseEntity<UserSubscriptionDTO> assignSubscription(
            @Valid @RequestBody AssignSubscriptionRequest request) {
        return ResponseEntity.ok(subService.assignSubscription(request));
    }

    @PatchMapping("/{subscriptionId}/override")
    public ResponseEntity<UserSubscriptionDTO> overrideLimits(
            @PathVariable Long subscriptionId, @RequestBody OverrideLimitsRequest request) {
        return ResponseEntity.ok(subService.overrideLimits(subscriptionId, request));
    }

    // ------------------- Owner xem giới hạn của chính mình -------------------

    @GetMapping("/my-limits")
    public ResponseEntity<OwnerLimitsResponse> getMyLimits() {
        Integer currentUserId = SecurityUtils.getCurrentUser().getId();
        return ResponseEntity.ok(subService.getCurrentLimits(currentUserId));
    }

    // Admin xem limits của bất kỳ owner nào
    @GetMapping("/owner/{ownerId}/limits")
    public ResponseEntity<OwnerLimitsResponse> getOwnerLimits(@PathVariable Integer ownerId) {
        return ResponseEntity.ok(subService.getCurrentLimits(ownerId));
    }
}
