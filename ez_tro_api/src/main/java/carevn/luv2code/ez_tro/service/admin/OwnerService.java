package carevn.luv2code.ez_tro.service.admin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import carevn.luv2code.ez_tro.dto.requests.OwnerRequest;
import carevn.luv2code.ez_tro.dto.response.OwnerResponse;

public interface OwnerService {
    Page<OwnerResponse> getAll(Pageable pageable);

    OwnerResponse create(OwnerRequest request);

    OwnerResponse update(Integer id, OwnerRequest request);

    void delete(Integer id);

    OwnerResponse getById(Integer id);

    OwnerResponse getMyProfile();
}
