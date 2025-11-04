package carevn.luv2code.ez_tro.service.user;

import java.util.List;

import carevn.luv2code.ez_tro.dto.requests.IncidentReportRequest;
import carevn.luv2code.ez_tro.dto.response.IncidentReportResponse;

public interface IncidentReportUserService {
    IncidentReportResponse create(Integer userId, IncidentReportRequest request);

    List<IncidentReportResponse> getAllByUserId(Integer userId);

    IncidentReportResponse update(Integer userId, Integer reportId, IncidentReportRequest request);

    void delete(Integer userId, Integer reportId);
}
