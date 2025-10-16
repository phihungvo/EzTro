package carevn.luv2code.ez_tro.service;

import java.util.List;

import carevn.luv2code.ez_tro.dto.requests.TenantRequest;
import carevn.luv2code.ez_tro.dto.response.TenantResponse;

public interface TenantService {
    TenantResponse create(TenantRequest request);

    TenantResponse update(Integer id, TenantRequest request);

    void delete(Integer id);

    TenantResponse getById(Integer id);

    List<TenantResponse> getAll();
}
