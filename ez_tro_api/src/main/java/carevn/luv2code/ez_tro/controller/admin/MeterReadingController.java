package carevn.luv2code.ez_tro.controller.admin;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.MeterReadingRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.MeterReadingResponse;
import carevn.luv2code.ez_tro.service.admin.MeterReadingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST Controller quản lý ghi chỉ số điện/nước (meter readings) theo phòng và kỳ.
 *
 * <p>Controller cung cấp các endpoint tạo mới, upsert và truy vấn chỉ số theo tháng/năm.
 */
@RestController
@RequestMapping("/api/meter-readings")
@RequiredArgsConstructor
public class MeterReadingController {

    private final MeterReadingService meterReadingService;

    /**
     * Tạo mới một bản ghi chỉ số điện/nước.
     *
     * @param request payload ghi chỉ số
     * @return response chứa meter reading vừa tạo
     */
    @PostMapping
    public ApiResponse<MeterReadingResponse> create(@Valid @RequestBody MeterReadingRequest request) {
        MeterReadingResponse response = meterReadingService.create(request);
        return ApiResponse.<MeterReadingResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Ghi chỉ số thành công")
                .result(response)
                .build();
    }

    /**
     * Upsert meter reading (nếu đã có theo room + utility + period thì update, chưa có thì create).
     *
     * @param request payload ghi chỉ số
     * @return response chứa meter reading sau khi lưu
     */
    @PutMapping("/upsert")
    public ApiResponse<MeterReadingResponse> upsert(@Valid @RequestBody MeterReadingRequest request) {
        MeterReadingResponse response = meterReadingService.upsert(request);
        return ApiResponse.<MeterReadingResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Lưu chỉ số thành công")
                .result(response)
                .build();
    }

    /**
     * Lấy danh sách meter readings theo phòng và kỳ (tháng/năm).
     *
     * @param roomId id phòng
     * @param month tháng
     * @param year năm
     * @return response chứa danh sách meter readings
     */
    @GetMapping("/room/{roomId}/period/{month}/{year}")
    public ApiResponse<List<MeterReadingResponse>> getByPeriod(
            @PathVariable Integer roomId, @PathVariable Integer month, @PathVariable Integer year) {

        List<MeterReadingResponse> responses = meterReadingService.getByRoomAndPeriod(roomId, month, year);
        return ApiResponse.<List<MeterReadingResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy chỉ số điện nước thành công")
                .result(responses)
                .build();
    }

    // Có thể thêm các endpoint khác: batch, history, export excel...
}
