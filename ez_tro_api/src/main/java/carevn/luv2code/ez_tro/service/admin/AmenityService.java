package carevn.luv2code.ez_tro.service.admin;

import java.util.List;

import org.springframework.data.domain.Page;

import carevn.luv2code.ez_tro.dto.requests.AmenityRequest;
import carevn.luv2code.ez_tro.dto.response.AmenityResponse;

public interface AmenityService {
    AmenityResponse create(AmenityRequest request);

    AmenityResponse update(Integer id, AmenityRequest request);

    void delete(Integer id);

    AmenityResponse getById(Integer id);

    List<AmenityResponse> getAll();

    Page<AmenityResponse> getAllAmenitiesPaged(int page, int size);

    List<AmenityResponse> getByBoardingHouse(Integer boardingHouseId);
}
