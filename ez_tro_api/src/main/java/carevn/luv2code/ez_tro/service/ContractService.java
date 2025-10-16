package carevn.luv2code.ez_tro.service;

import java.util.List;

import carevn.luv2code.ez_tro.dto.requests.ContractRequest;
import carevn.luv2code.ez_tro.dto.response.ContractResponse;

public interface ContractService {
    ContractResponse create(ContractRequest request);

    ContractResponse update(Integer id, ContractRequest request);

    void delete(Integer id);

    ContractResponse getById(Integer id);

    List<ContractResponse> getAll();
}
