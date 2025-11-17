package carevn.luv2code.ez_tro.service.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import carevn.luv2code.ez_tro.dto.requests.ElectricWaterRecordRequest;
import carevn.luv2code.ez_tro.dto.response.ElectricWaterRecordResponse;

public interface ElectricWaterRecordService {
    ElectricWaterRecordResponse create(ElectricWaterRecordRequest request);

    ElectricWaterRecordResponse update(Integer id, ElectricWaterRecordRequest request);

    void delete(Integer id);

    ElectricWaterRecordResponse getById(Integer id);

    List<ElectricWaterRecordResponse> getAll();

    Page<ElectricWaterRecordResponse> getAll(Pageable pageable);

    Page<ElectricWaterRecordResponse> filter(Integer roomId, Integer month, Integer year, int page, int size);

    List<ElectricWaterRecordResponse> getByRoom(Integer roomId);
}
