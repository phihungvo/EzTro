package carevn.luv2code.ez_tro.service.admin;

import java.util.List;

import carevn.luv2code.ez_tro.dto.requests.MeterReadingRequest;
import carevn.luv2code.ez_tro.dto.response.MeterReadingResponse;

public interface MeterReadingService {

    MeterReadingResponse create(MeterReadingRequest request);

    MeterReadingResponse upsert(MeterReadingRequest request);

    List<MeterReadingResponse> getByRoomAndPeriod(Integer roomId, Integer month, Integer year);

    List<MeterReadingResponse> getHistoryByRoom(Integer roomId);

    List<MeterReadingResponse> batchCreate(List<MeterReadingRequest> requests);
}
