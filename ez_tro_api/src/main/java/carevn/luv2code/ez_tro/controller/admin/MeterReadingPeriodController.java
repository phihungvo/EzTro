package carevn.luv2code.ez_tro.controller.admin;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.MeterPeriodRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.MeterPeriodResponse;
import carevn.luv2code.ez_tro.entity.MeterReadingPeriod;
import carevn.luv2code.ez_tro.service.admin.MeterReadingPeriodService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST Controller quản lý kỳ ghi chỉ số (meter reading period).
 *
 * <p>Kỳ ghi chỉ số giúp khóa/đóng dữ liệu theo tháng/năm để tránh chỉnh sửa sau khi chốt.
 */
@RestController
@RequestMapping("/api/meter-periods")
@RequiredArgsConstructor
public class MeterReadingPeriodController {

    private final MeterReadingPeriodService periodService;

    /**
     * Tạo mới kỳ ghi chỉ số.
     *
     * @param request payload tạo kỳ (month/year/start/end)
     * @return response chứa kỳ vừa tạo
     */
    @PostMapping
    public ApiResponse<MeterPeriodResponse> create(@Valid @RequestBody MeterPeriodRequest request) {
        return ApiResponse.<MeterPeriodResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Tạo kỳ ghi chỉ số thành công")
                .result(periodService.create(request))
                .build();
    }

    /**
     * Lấy danh sách tất cả kỳ ghi chỉ số.
     *
     * @return response chứa danh sách period
     */
    @GetMapping
    public ApiResponse<List<MeterReadingPeriod>> getAll() {
        return ApiResponse.<List<MeterReadingPeriod>>builder()
                .code(HttpStatus.CREATED.value())
                .message("Tạo kỳ ghi chỉ số thành công")
                .result(periodService.findAll())
                .build();
    }

    /**
     * Xác nhận kỳ ghi chỉ số (từ DRAFT -> CONFIRMED).
     *
     * @param id id period
     * @return response chứa period sau khi confirm
     */
    @PostMapping("/{id}/confirm")
    public ApiResponse<MeterPeriodResponse> confirm(@PathVariable Integer id) {
        return ApiResponse.<MeterPeriodResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Xác nhận kỳ ghi chỉ số thành công")
                .result(periodService.confirm(id))
                .build();
    }

    /**
     * Khóa kỳ ghi chỉ số (từ CONFIRMED -> LOCKED).
     *
     * @param id id period
     * @return response chứa period sau khi lock
     */
    @PostMapping("/{id}/lock")
    public ApiResponse<MeterPeriodResponse> lock(@PathVariable Integer id) {
        return ApiResponse.<MeterPeriodResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Khóa kỳ ghi chỉ số thành công")
                .result(periodService.lock(id))
                .build();
    }
}
