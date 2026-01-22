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

@RestController
@RequestMapping("/api/meter-readings")
@RequiredArgsConstructor
public class MeterReadingController {

    private final MeterReadingService meterReadingService;

    @PostMapping
    public ApiResponse<MeterReadingResponse> create(@Valid @RequestBody MeterReadingRequest request) {
        MeterReadingResponse response = meterReadingService.create(request);
        return ApiResponse.<MeterReadingResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Ghi chỉ số thành công")
                .result(response)
                .build();
    }

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
