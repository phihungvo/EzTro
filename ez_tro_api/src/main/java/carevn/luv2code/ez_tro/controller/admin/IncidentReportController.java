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

/**
 * REST Controller quản lý báo cáo sự cố (Incident Report) phía admin/owner.
 *
 * <p>Controller cung cấp tạo mới report và truy vấn theo phòng/người thuê.
 */
@RestController
@RequestMapping("/api/incident-reports")
@RequiredArgsConstructor
public class IncidentReportController {

    private final IncidentReportService incidentReportService;

    /**
     * Tạo mới một báo cáo sự cố.
     *
     * @param request payload báo cáo sự cố (roomId, title, description...)
     * @return response chứa report vừa tạo
     */
    @PostMapping
    public ApiResponse<IncidentReportResponse> create(@RequestBody IncidentReportRequest request) {
        return ApiResponse.<IncidentReportResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Incident Report created successfully")
                .result(incidentReportService.create(request))
                .build();
    }

    /**
     * Lấy danh sách báo cáo sự cố phân trang.
     *
     * @param page trang (0-based)
     * @param size kích thước trang
     * @return danh sách report dạng {@link Page}
     */
    @GetMapping("/paged")
    public ResponseEntity<Page<IncidentReportResponse>> getAllBuildings(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Page<IncidentReportResponse> buildings = incidentReportService.getAllPaged(page, size);
        return ResponseEntity.ok(buildings);
    }

    /**
     * Lấy danh sách báo cáo sự cố theo phòng.
     *
     * @param roomId id phòng
     * @return response chứa danh sách report
     */
    @GetMapping("/room/{roomId}")
    public ApiResponse<List<IncidentReportResponse>> getByRoom(@PathVariable Integer roomId) {
        return ApiResponse.<List<IncidentReportResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get Incident Report by room successfully")
                .result(incidentReportService.getByRoom(roomId))
                .build();
    }

    /**
     * Lấy danh sách báo cáo sự cố theo người thuê.
     *
     * @param tenantId id tenant
     * @return response chứa danh sách report
     */
    @GetMapping("/tenant/{tenantId}")
    public ApiResponse<List<IncidentReportResponse>> getByTenant(@PathVariable Integer tenantId) {
        return ApiResponse.<List<IncidentReportResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get Incident Report by tenant successfully")
                .result(incidentReportService.getByTenant(tenantId))
                .build();
    }
}
