package carevn.luv2code.ez_tro.service.user;

import java.util.List;

import carevn.luv2code.ez_tro.dto.response.MeterReadingResponse;

public interface UserUtilityService {

    List<MeterReadingResponse> getMyMeterReadingsByPeriod(Integer userId, Integer month, Integer year);

//    List<MeterReadingResponse> getMyMeterReadingHistory(Integer userId, int limit);
}
