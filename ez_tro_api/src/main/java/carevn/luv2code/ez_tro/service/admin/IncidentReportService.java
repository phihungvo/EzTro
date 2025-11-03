package carevn.luv2code.ez_tro.service.admin;

import java.util.List;

import org.springframework.data.domain.Page;

import carevn.luv2code.ez_tro.dto.requests.IncidentReportRequest;
import carevn.luv2code.ez_tro.dto.response.IncidentReportResponse;

public interface IncidentReportService {
    IncidentReportResponse create(IncidentReportRequest request);

    Page<IncidentReportResponse> getAllPaged(int page, int size);

    List<IncidentReportResponse> getByRoom(Integer roomId);

    List<IncidentReportResponse> getByTenant(Integer tenantId);
}
