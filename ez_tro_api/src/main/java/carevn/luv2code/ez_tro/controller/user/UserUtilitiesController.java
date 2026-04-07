package carevn.luv2code.ez_tro.controller.user;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.MeterReadingResponse;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.user.UserUtilityService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/utilities")
@RequiredArgsConstructor
public class UserUtilitiesController {

    private final UserUtilityService userUtilityService;

    /**
     * Lấy thông tin my meter readings by period.
     */
    @GetMapping("/meter-readings/period/{month}/{year}")
    public ApiResponse<List<MeterReadingResponse>> getMyMeterReadingsByPeriod(
            @PathVariable Integer month, @PathVariable Integer year) {
        Integer userId = SecurityUtils.getCurrentUserId();
        List<MeterReadingResponse> responses = userUtilityService.getMyMeterReadingsByPeriod(userId, month, year);
        return ApiResponse.<List<MeterReadingResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy chỉ số điện nước theo kỳ thành công")
                .result(responses)
                .build();
    }

    /**
     * Lấy thông tin my meter reading history.
     */
    @GetMapping("/meter-readings/history")
    public ApiResponse<List<MeterReadingResponse>> getMyMeterReadingHistory(
            @RequestParam(required = false, defaultValue = "12") int limit) {
        Integer userId = SecurityUtils.getCurrentUserId();
//        List<MeterReadingResponse> responses = userUtilityService.getMyMeterReadingHistory(userId, limit);
        List<MeterReadingResponse> responses = null;
        return ApiResponse.<List<MeterReadingResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy lịch sử chỉ số điện nước thành công")
                .result(responses)
                .build();
    }

    /**
     * Lấy thông tin my meter readings for current period.
     */
    @GetMapping("/meter-readings/current-period")
    public ApiResponse<List<MeterReadingResponse>> getMyMeterReadingsForCurrentPeriod() {
        LocalDate now = LocalDate.now();
        Integer userId = SecurityUtils.getCurrentUserId();
        List<MeterReadingResponse> responses =
                userUtilityService.getMyMeterReadingsByPeriod(userId, now.getMonthValue(), now.getYear());
        return ApiResponse.<List<MeterReadingResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy chỉ số điện nước kỳ hiện tại thành công")
                .result(responses)
                .build();
    }
}
