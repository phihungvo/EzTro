package carevn.luv2code.ez_tro.service.admin;

import java.util.List;

import org.springframework.data.domain.Page;

import carevn.luv2code.ez_tro.dto.requests.UtilityRequest;
import carevn.luv2code.ez_tro.dto.response.UtilityResponse;

public interface UtilityService {
    UtilityResponse create(UtilityRequest request);

    UtilityResponse update(Integer id, UtilityRequest request);

    void delete(Integer id);

    UtilityResponse getById(Integer id);

    List<UtilityResponse> getAll();

    Page<UtilityResponse> getAllPaged(int page, int size);

    List<UtilityResponse> getByBoardingHouse(Integer boardingHouseId);

    Page<UtilityResponse> getActiveByBoardingHouse(Integer boardingHouseId, int page, int size);
}
