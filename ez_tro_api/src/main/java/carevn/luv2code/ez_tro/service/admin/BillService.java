package carevn.luv2code.ez_tro.service.admin;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;

import carevn.luv2code.ez_tro.dto.requests.BillRequest;
import carevn.luv2code.ez_tro.dto.requests.BillSendRequest;
import carevn.luv2code.ez_tro.dto.response.BillDetailResponse;
import carevn.luv2code.ez_tro.dto.response.BillResponse;

/**
 * Service contract cho nghiệp vụ Hóa đơn (Bill) phía admin/owner.
 */
public interface BillService {
    BillResponse create(BillRequest request);

    BillResponse update(Integer id, BillRequest request);

    BillResponse send(Integer id, BillSendRequest request);

    void delete(Integer id);

    BillResponse cancel(Integer id);

    BillResponse getById(Integer id);

    BillDetailResponse getDetail(Integer id);

    List<BillResponse> getAll();

    //    List<BillResponse> getBillsByTenant(Integer tenantId);

    Page<BillResponse> filterBills(
            String search,
            String status,
            Boolean paid,
            Integer month,
            Integer year,
            Integer contractId,
            LocalDate startDate,
            LocalDate endDate,
            int page,
            int size);
}
