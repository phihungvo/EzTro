package carevn.luv2code.ez_tro.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import carevn.luv2code.ez_tro.entity.SubscriptionPlan;

public interface SubscriptionPlanRepository
        extends JpaRepository<SubscriptionPlan, Integer>, JpaSpecificationExecutor<SubscriptionPlan> {
    Optional<SubscriptionPlan> findByCode(String code);

    Optional<SubscriptionPlan> findFirstByIsActiveTrueOrderByIdAsc();
}
