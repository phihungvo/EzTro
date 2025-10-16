package carevn.luv2code.ez_tro.service;

import java.util.List;

import carevn.luv2code.ez_tro.dto.requests.BillRequest;
import carevn.luv2code.ez_tro.dto.response.BillResponse;

public interface BillService {
    BillResponse create(BillRequest request);

    BillResponse update(Integer id, BillRequest request);

    void delete(Integer id);

    BillResponse getById(Integer id);

    List<BillResponse> getAll();
}
