package carevn.luv2code.ez_tro.service;

import java.util.List;

import carevn.luv2code.ez_tro.dto.requests.ElectricWaterRecordRequest;
import carevn.luv2code.ez_tro.dto.response.ElectricWaterRecordResponse;

public interface ElectricWaterRecordService {
    ElectricWaterRecordResponse create(ElectricWaterRecordRequest request);

    ElectricWaterRecordResponse update(Integer id, ElectricWaterRecordRequest request);

    void delete(Integer id);

    ElectricWaterRecordResponse getById(Integer id);

    List<ElectricWaterRecordResponse> getAll();
}
