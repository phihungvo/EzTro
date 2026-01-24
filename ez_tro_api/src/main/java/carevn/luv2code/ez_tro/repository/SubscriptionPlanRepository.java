package carevn.luv2code.ez_tro.repository;

import carevn.luv2code.ez_tro.entity.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Integer>, JpaSpecificationExecutor<SubscriptionPlan> {
    Optional<SubscriptionPlan> findByCode(String code);
}