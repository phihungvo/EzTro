package carevn.luv2code.ez_tro.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.ContractRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.ContractResponse;
import carevn.luv2code.ez_tro.service.ContractService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    @PostMapping
    public ApiResponse<ContractResponse> create(@Valid @RequestBody ContractRequest request) {
        ContractResponse response = contractService.create(request);
        return ApiResponse.<ContractResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Contract created successfully")
                .result(response)
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<ContractResponse> update(@PathVariable Integer id, @Valid @RequestBody ContractRequest request) {
        ContractResponse response = contractService.update(id, request);
        return ApiResponse.<ContractResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Contract updated successfully")
                .result(response)
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        contractService.delete(id);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.NO_CONTENT.value())
                .message("Contract deleted successfully")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<ContractResponse> getById(@PathVariable Integer id) {
        ContractResponse response = contractService.getById(id);
        return ApiResponse.<ContractResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get contract successfully")
                .result(response)
                .build();
    }

    @GetMapping
    public ApiResponse<List<ContractResponse>> getAll() {
        List<ContractResponse> responses = contractService.getAll();
        return ApiResponse.<List<ContractResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get all contracts successfully")
                .result(responses)
                .build();
    }
}
