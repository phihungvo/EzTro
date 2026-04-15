package carevn.luv2code.ez_tro.service.admin;

import java.util.List;

import carevn.luv2code.ez_tro.dto.requests.MeterPeriodRequest;
import carevn.luv2code.ez_tro.dto.response.MeterPeriodResponse;
import carevn.luv2code.ez_tro.entity.MeterReadingPeriod;

/**
 * Service contract quản lý kỳ ghi chỉ số (meter reading period).
 */
public interface MeterReadingPeriodService {

    List<MeterReadingPeriod> findAll();

    MeterPeriodResponse create(MeterPeriodRequest request);

    MeterPeriodResponse confirm(Integer periodId);

    MeterPeriodResponse lock(Integer periodId);
}
