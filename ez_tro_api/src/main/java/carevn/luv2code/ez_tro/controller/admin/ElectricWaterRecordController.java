package carevn.luv2code.ez_tro.controller.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.ElectricWaterRecordRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.ElectricWaterRecordResponse;
import carevn.luv2code.ez_tro.service.admin.ElectricWaterRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/electric-water-records")
@RequiredArgsConstructor
public class ElectricWaterRecordController {

    private final ElectricWaterRecordService recordService;

    @PostMapping
    public ApiResponse<ElectricWaterRecordResponse> create(@Valid @RequestBody ElectricWaterRecordRequest request) {
        ElectricWaterRecordResponse response = recordService.create(request);
        return ApiResponse.<ElectricWaterRecordResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Ghi chỉ số thành công")
                .result(response)
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<ElectricWaterRecordResponse> update(
            @PathVariable Integer id, @Valid @RequestBody ElectricWaterRecordRequest request) {
        ElectricWaterRecordResponse response = recordService.update(id, request);
        return ApiResponse.<ElectricWaterRecordResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Cập nhật chỉ số thành công")
                .result(response)
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        recordService.delete(id);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.NO_CONTENT.value())
                .message("Xóa chỉ số thành công")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<ElectricWaterRecordResponse> getById(@PathVariable Integer id) {
        ElectricWaterRecordResponse response = recordService.getById(id);
        return ApiResponse.<ElectricWaterRecordResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get electric/water record successfully")
                .result(response)
                .build();
    }

    @GetMapping
    public ApiResponse<List<ElectricWaterRecordResponse>> getAll() {
        List<ElectricWaterRecordResponse> responses = recordService.getAll();
        return ApiResponse.<List<ElectricWaterRecordResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get all electric/water records successfully")
                .result(responses)
                .build();
    }

    @GetMapping("/filter")
    public ApiResponse<Page<ElectricWaterRecordResponse>> filter(
            @RequestParam(required = false) Integer roomId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ApiResponse.<Page<ElectricWaterRecordResponse>>builder()
                .code(200)
                .message("Lọc thành công")
                .result(recordService.filter(roomId, month, year, page, size))
                .build();
    }

    @GetMapping("/room/{roomId}")
    public ApiResponse<List<ElectricWaterRecordResponse>> getByRoom(@PathVariable Integer roomId) {
        return ApiResponse.<List<ElectricWaterRecordResponse>>builder()
                .code(200)
                .message("Lấy theo phòng thành công")
                .result(recordService.getByRoom(roomId))
                .build();
    }
}
