package carevn.luv2code.ez_tro.controller.user;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.IncidentReportRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.IncidentReportResponse;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.user.IncidentReportUserService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/incident-reports")
@RequiredArgsConstructor
public class IncidentReportUserController {

    private final IncidentReportUserService incidentReportService;

    @GetMapping
    public ApiResponse<List<IncidentReportResponse>> getMyBills() {
        Integer userId = SecurityUtils.getCurrentUserId();
        List<IncidentReportResponse> responses = incidentReportService.getAllByUserId(userId);
        return ApiResponse.<List<IncidentReportResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách báo cáo sự cố của tôi thành công")
                .result(responses)
                .build();
    }

    @PostMapping
    public ApiResponse<IncidentReportResponse> create(@RequestBody IncidentReportRequest request) {
        Integer userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.<IncidentReportResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Incident Report created successfully")
                .result(incidentReportService.create(userId, request))
                .build();
    }
}
