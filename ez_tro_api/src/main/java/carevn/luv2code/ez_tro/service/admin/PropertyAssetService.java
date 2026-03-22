package carevn.luv2code.ez_tro.service.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import carevn.luv2code.ez_tro.dto.requests.PropertyAssetRequest;
import carevn.luv2code.ez_tro.dto.response.PropertyAssetResponse;
import carevn.luv2code.ez_tro.enums.PropertyAssetCategory;
import carevn.luv2code.ez_tro.enums.PropertyAssetCondition;
import carevn.luv2code.ez_tro.enums.PropertyAssetStatus;

public interface PropertyAssetService {
    PropertyAssetResponse create(PropertyAssetRequest request);

    PropertyAssetResponse update(Integer id, PropertyAssetRequest request);

    void delete(Integer id);

    PropertyAssetResponse getById(Integer id);

    List<PropertyAssetResponse> getAllByRole();

    List<PropertyAssetResponse> getByRoomId(Integer roomId);

    Page<PropertyAssetResponse> filter(
            String search,
            PropertyAssetCategory category,
            PropertyAssetStatus status,
            PropertyAssetCondition condition,
            Integer boardingHouseId,
            Integer roomId,
            Pageable pageable);
}
