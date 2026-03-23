package carevn.luv2code.ez_tro.service.admin;

import java.util.List;

import org.springframework.data.domain.Page;

import carevn.luv2code.ez_tro.dto.requests.ContractRequest;
import carevn.luv2code.ez_tro.dto.response.BillResponse;
import carevn.luv2code.ez_tro.dto.response.ContractDetailResponse;
import carevn.luv2code.ez_tro.dto.response.ContractResponse;

public interface ContractService {
    ContractResponse create(ContractRequest request);

    ContractResponse update(Integer id, ContractRequest request);

    void delete(Integer id);

    ContractDetailResponse getById(Integer id);

    List<ContractResponse> getAll();

    List<ContractResponse> getAllActiveContracts();

    Page<ContractResponse> getAllContractPaged(int page, int size);

    List<ContractResponse> getByRoom(Integer roomId);

    List<ContractResponse> getByTenant(Integer tenantId);

    List<BillResponse> getBillsByContract(Integer contractId);

    BillResponse createBillForContract(Integer contractId, Object billRequestObj);

    //    Page<ContractResponse> filterContracts(
    //            String search, String startDate, String endDate, String status, int page, int size);

    Page<ContractResponse> filterContracts(
            String search,
            String startDate,
            String endDate,
            String status,
            Integer boardingHouseId,
            Integer roomId,
            int page,
            int size);
}
