package carevn.luv2code.ez_tro.service.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import carevn.luv2code.ez_tro.dto.requests.BuildingRequest;
import carevn.luv2code.ez_tro.dto.response.BuildingResponse;

public interface BuildingService {
    BuildingResponse create(BuildingRequest request);

    BuildingResponse update(Integer id, BuildingRequest request);

    void delete(Integer id);

    BuildingResponse getById(Integer id);

    List<BuildingResponse> getAll();

    Page<BuildingResponse> getAllBuildingsPaged(int page, int size);

    Page<BuildingResponse> getAllBuildingsByRole(Pageable pageable);

    List<BuildingResponse> getByBoardingHouse(Integer boardingHouseId);
}
