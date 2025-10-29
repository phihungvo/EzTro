package carevn.luv2code.ez_tro.service.admin;

import java.util.List;

import org.springframework.data.domain.Page;

import carevn.luv2code.ez_tro.dto.requests.TenantRequest;
import carevn.luv2code.ez_tro.dto.response.CurrentRentalInfoResponse;
import carevn.luv2code.ez_tro.dto.response.TenantDetailResponse;
import carevn.luv2code.ez_tro.dto.response.TenantResponse;

public interface TenantService {
    TenantResponse create(TenantRequest request);

    TenantResponse update(Integer id, TenantRequest request);

    void delete(Integer id);

    TenantResponse getById(Integer id);

    TenantDetailResponse getTenantDetail(Integer id);

    CurrentRentalInfoResponse getCurrentRentalInfo(Integer id);

    List<TenantResponse> getAll();

    Page<TenantResponse> getAllTenantsPaged(int page, int size);
}
