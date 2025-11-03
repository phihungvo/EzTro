package carevn.luv2code.ez_tro.controller.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.IncidentReportRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.IncidentReportResponse;
import carevn.luv2code.ez_tro.service.admin.IncidentReportService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/incident-reports")
@RequiredArgsConstructor
public class IncidentReportController {

    private final IncidentReportService incidentReportService;

    @PostMapping
    public ApiResponse<IncidentReportResponse> create(@RequestBody IncidentReportRequest request) {
        return ApiResponse.<IncidentReportResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Incident Report created successfully")
                .result(incidentReportService.create(request))
                .build();
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<IncidentReportResponse>> getAllBuildings(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Page<IncidentReportResponse> buildings = incidentReportService.getAllPaged(page, size);
        return ResponseEntity.ok(buildings);
    }

    @GetMapping("/room/{roomId}")
    public ApiResponse<List<IncidentReportResponse>> getByRoom(@PathVariable Integer roomId) {
        return ApiResponse.<List<IncidentReportResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get Incident Report by room successfully")
                .result(incidentReportService.getByRoom(roomId))
                .build();
    }

    @GetMapping("/tenant/{tenantId}")
    public ApiResponse<List<IncidentReportResponse>> getByTenant(@PathVariable Integer tenantId) {
        return ApiResponse.<List<IncidentReportResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get Incident Report by tenant successfully")
                .result(incidentReportService.getByTenant(tenantId))
                .build();
    }
}
