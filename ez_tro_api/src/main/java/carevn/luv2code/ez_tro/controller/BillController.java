package carevn.luv2code.ez_tro.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.BillRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.BillResponse;
import carevn.luv2code.ez_tro.service.BillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;

    @PostMapping
    public ApiResponse<BillResponse> create(@Valid @RequestBody BillRequest request) {
        BillResponse response = billService.create(request);
        return ApiResponse.<BillResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Bill created successfully")
                .result(response)
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<BillResponse> update(@PathVariable Integer id, @Valid @RequestBody BillRequest request) {
        BillResponse response = billService.update(id, request);
        return ApiResponse.<BillResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Bill updated successfully")
                .result(response)
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        billService.delete(id);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.NO_CONTENT.value())
                .message("Bill deleted successfully")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<BillResponse> getById(@PathVariable Integer id) {
        BillResponse response = billService.getById(id);
        return ApiResponse.<BillResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get bill successfully")
                .result(response)
                .build();
    }

    @GetMapping
    public ApiResponse<List<BillResponse>> getAll() {
        List<BillResponse> responses = billService.getAll();
        return ApiResponse.<List<BillResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get all bills successfully")
                .result(responses)
                .build();
    }
}
