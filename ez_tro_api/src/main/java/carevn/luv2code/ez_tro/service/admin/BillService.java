package carevn.luv2code.ez_tro.service.admin;

import java.util.List;

import org.springframework.data.domain.Page;

import carevn.luv2code.ez_tro.dto.requests.BillRequest;
import carevn.luv2code.ez_tro.dto.response.BillResponse;

public interface BillService {
    BillResponse create(BillRequest request);

    BillResponse update(Integer id, BillRequest request);

    void delete(Integer id);

    BillResponse getById(Integer id);

    List<BillResponse> getAll();

    //    List<BillResponse> getBillsByTenant(Integer tenantId);

    Page<BillResponse> filterBills(
            String search,
            String status,
            Boolean paid,
            Integer month,
            Integer year,
            Integer contractId,
            int page,
            int size);
}
