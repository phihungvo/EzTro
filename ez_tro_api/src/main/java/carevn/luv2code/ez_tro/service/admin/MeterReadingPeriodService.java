package carevn.luv2code.ez_tro.service.admin;

import carevn.luv2code.ez_tro.dto.requests.MeterPeriodRequest;
import carevn.luv2code.ez_tro.dto.response.MeterPeriodResponse;
import carevn.luv2code.ez_tro.entity.MeterReadingPeriod;

import java.util.List;

public interface MeterReadingPeriodService {

    List<MeterReadingPeriod> findAll();

    MeterPeriodResponse create(MeterPeriodRequest request);

    MeterPeriodResponse confirm(Integer periodId);

    MeterPeriodResponse lock(Integer periodId);
}
