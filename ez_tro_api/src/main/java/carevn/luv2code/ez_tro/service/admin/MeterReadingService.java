package carevn.luv2code.ez_tro.service.admin;

import carevn.luv2code.ez_tro.dto.requests.MeterReadingRequest;
import carevn.luv2code.ez_tro.dto.response.MeterReadingResponse;

import java.util.List;

public interface MeterReadingService {

    MeterReadingResponse create(MeterReadingRequest request);

    List<MeterReadingResponse> getByRoomAndPeriod(Integer roomId, Integer month, Integer year);

    List<MeterReadingResponse> getHistoryByRoom(Integer roomId);

    List<MeterReadingResponse> batchCreate(List<MeterReadingRequest> requests);
}
