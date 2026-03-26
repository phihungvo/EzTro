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

/**
 * REST Controller báo cáo sự cố (Incident Report) phía người thuê.
 *
 * <p>User chỉ thao tác trên dữ liệu của chính mình (lấy {@code userId} từ {@link SecurityUtils}).
 */
@RestController
@RequestMapping("/api/user/incident-reports")
@RequiredArgsConstructor
public class IncidentReportUserController {

    private final IncidentReportUserService incidentReportService;

    /**
     * Lấy danh sách báo cáo sự cố của user hiện tại.
     *
     * @return response chứa danh sách report
     */
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

    /**
     * Tạo mới báo cáo sự cố cho user hiện tại (gắn theo hợp đồng active nếu có).
     *
     * @param request payload tạo report
     * @return response chứa report vừa tạo
     */
    @PostMapping
    public ApiResponse<IncidentReportResponse> create(@RequestBody IncidentReportRequest request) {
        Integer userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.<IncidentReportResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Incident Report created successfully")
                .result(incidentReportService.create(userId, request))
                .build();
    }

    /**
     * Cập nhật báo cáo sự cố theo id.
     *
     * @param id id report
     * @param request payload cập nhật report
     * @return response chứa report sau cập nhật
     */
    @PutMapping("/{id}")
    public ApiResponse<IncidentReportResponse> update(
            @PathVariable("id") Integer id, @RequestBody IncidentReportRequest request) {

        Integer userId = SecurityUtils.getCurrentUserId();
        IncidentReportResponse response = incidentReportService.update(userId, id, request);

        return ApiResponse.<IncidentReportResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Cập nhật báo cáo sự cố thành công")
                .result(response)
                .build();
    }

    /**
     * Xóa báo cáo sự cố theo id.
     *
     * @param id id report
     * @return response không có payload
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable("id") Integer id) {
        incidentReportService.delete(id);

        return ApiResponse.<Void>builder()
                .code(HttpStatus.NO_CONTENT.value())
                .message("Xóa báo cáo sự cố thành công")
                .build();
    }
}
