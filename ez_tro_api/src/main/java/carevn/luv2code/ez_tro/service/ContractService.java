package carevn.luv2code.ez_tro.service;

import java.util.List;

import org.springframework.data.domain.Page;

import carevn.luv2code.ez_tro.dto.requests.ContractRequest;
import carevn.luv2code.ez_tro.dto.response.BillResponse;
import carevn.luv2code.ez_tro.dto.response.ContractResponse;

public interface ContractService {
    ContractResponse create(ContractRequest request);

    ContractResponse update(Integer id, ContractRequest request);

    void delete(Integer id);

    ContractResponse getById(Integer id);

    List<ContractResponse> getAll();

    Page<ContractResponse> getAllContractPaged(int page, int size);

    List<ContractResponse> getByRoom(Integer roomId);

    List<ContractResponse> getByTenant(Integer tenantId);

    List<BillResponse> getBillsByContract(Integer contractId);

    BillResponse createBillForContract(Integer contractId, Object billRequestObj);
}
