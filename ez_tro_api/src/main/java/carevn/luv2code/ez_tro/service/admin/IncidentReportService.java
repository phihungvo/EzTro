package carevn.luv2code.ez_tro.service.admin;

import java.util.List;

import org.springframework.data.domain.Page;

import carevn.luv2code.ez_tro.dto.requests.IncidentReportRequest;
import carevn.luv2code.ez_tro.dto.response.IncidentReportResponse;

/**
 * Service contract quản lý báo cáo sự cố (Incident Report) phía admin/owner.
 */
public interface IncidentReportService {
    IncidentReportResponse create(IncidentReportRequest request);

    IncidentReportResponse update(Integer incidentId, IncidentReportRequest request);

    void delete(Integer incidentId);

    Page<IncidentReportResponse> getAllPaged(int page, int size);

    List<IncidentReportResponse> getByRoom(Integer roomId);

    List<IncidentReportResponse> getByTenant(Integer tenantId);
}
