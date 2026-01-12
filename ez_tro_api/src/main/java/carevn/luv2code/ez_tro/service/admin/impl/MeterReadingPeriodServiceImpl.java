package carevn.luv2code.ez_tro.service.admin.impl;

import carevn.luv2code.ez_tro.dto.requests.MeterPeriodRequest;
import carevn.luv2code.ez_tro.dto.response.MeterPeriodResponse;
import carevn.luv2code.ez_tro.entity.MeterReadingPeriod;
import carevn.luv2code.ez_tro.enums.PeriodStatus;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.repository.MeterReadingPeriodRepository;
import carevn.luv2code.ez_tro.security.AuthorizationService;
import carevn.luv2code.ez_tro.service.admin.MeterReadingPeriodService;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MeterReadingPeriodServiceImpl implements MeterReadingPeriodService {

    private final MeterReadingPeriodRepository periodRepo;
    private final AuthorizationService authService;

    @Override
    public List<MeterReadingPeriod> findAll() {
        return periodRepo.findAll();
    }

    // Tạo kỳ ghi chỉ số mới
    @Override
    public MeterPeriodResponse create(MeterPeriodRequest request) {
        if (periodRepo.findByPeriodMonthAndPeriodYear(request.getPeriodMonth(), request.getPeriodYear()).isPresent()) {
            throw new AppException(ErrorCode.PERIOD_ALREADY_EXISTS);
        }

        MeterReadingPeriod period = MeterReadingPeriod.builder()
                .periodMonth(request.getPeriodMonth())
                .periodYear(request.getPeriodYear())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(PeriodStatus.DRAFT)
                .build();

        return mapToResponse(periodRepo.save(period));
    }

    // Xác nhận kỳ ghi chỉ số
    @Override
    public MeterPeriodResponse confirm(Integer periodId) {
        MeterReadingPeriod period = getPeriodOrThrow(periodId);
        if (period.getStatus() != PeriodStatus.DRAFT) {
            throw new AppException(ErrorCode.PERIOD_ALREADY_CONFIRMED);
        }
        period.setStatus(PeriodStatus.CONFIRMED);
        period.setConfirmedAt(LocalDateTime.now());
        return mapToResponse(periodRepo.save(period));
    }

    // Khóa kỳ ghi chỉ số
    @Override
    public MeterPeriodResponse lock(Integer periodId) {
        MeterReadingPeriod period = getPeriodOrThrow(periodId);
        if (period.getStatus() != PeriodStatus.CONFIRMED) {
            throw new AppException(ErrorCode.PERIOD_MUST_BE_CONFIRMED_BEFORE_LOCK);
        }
        period.setStatus(PeriodStatus.LOCKED);
        period.setLockedAt(LocalDateTime.now());
        return mapToResponse(periodRepo.save(period));
    }

    private MeterReadingPeriod getPeriodOrThrow(Integer id) {
        return periodRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PERIOD_NOT_FOUND));
    }

    // mapper đơn giản (có thể dùng MapStruct)
    private MeterPeriodResponse mapToResponse(MeterReadingPeriod p) {
        return MeterPeriodResponse.builder()
                .id(p.getId())
                .periodMonth(p.getPeriodMonth())
                .periodYear(p.getPeriodYear())
                .startDate(p.getStartDate())
                .endDate(p.getEndDate())
                .status(p.getStatus().name())
                .confirmedAt(p.getConfirmedAt())
                .lockedAt(p.getLockedAt())
                .build();
    }
}