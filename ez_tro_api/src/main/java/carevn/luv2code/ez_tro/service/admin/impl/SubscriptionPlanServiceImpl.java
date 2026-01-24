package carevn.luv2code.ez_tro.service.admin.impl;

import carevn.luv2code.ez_tro.dto.SubscriptionPlanDTO;
import carevn.luv2code.ez_tro.dto.requests.SubscriptionPlanCreateRequest;
import carevn.luv2code.ez_tro.entity.SubscriptionPlan;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.SubscriptionPlanMapper;
import carevn.luv2code.ez_tro.repository.SubscriptionPlanRepository;
import carevn.luv2code.ez_tro.service.admin.SubscriptionPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionPlanServiceImpl implements SubscriptionPlanService {

    private final SubscriptionPlanRepository planRepository;
    private final SubscriptionPlanMapper planMapper;

    @Override
    @Transactional
    public SubscriptionPlanDTO create(SubscriptionPlanCreateRequest request) {
        if (planRepository.findByCode(request.getCode()).isPresent()) {
            throw new AppException(ErrorCode.SUBSCRIPTION_PLAN_CODE_ALREADY_EXISTS);
        }

        SubscriptionPlan plan = planMapper.toEntity(request);
        plan.setIsActive(true);
        plan = planRepository.save(plan);
        return planMapper.toDTO(plan);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubscriptionPlanDTO> getAllActive() {
        return planRepository.findAll().stream()
                .filter(SubscriptionPlan::getIsActive)
                .map(planMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SubscriptionPlanDTO getById(Integer id) {
        SubscriptionPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND));
        return planMapper.toDTO(plan);
    }

    @Override
    @Transactional
    public SubscriptionPlanDTO update(Integer id, SubscriptionPlanCreateRequest request) {
        SubscriptionPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND));

        planMapper.updateFromRequest(request, plan);
        plan = planRepository.save(plan);
        return planMapper.toDTO(plan);
    }

    @Override
    @Transactional
    public void delete(Integer id) {
        SubscriptionPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND));
        plan.setIsActive(false);
        planRepository.save(plan);
    }
}