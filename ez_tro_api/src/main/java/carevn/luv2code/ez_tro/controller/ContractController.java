package carevn.luv2code.ez_tro.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.BillRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.BillResponse;
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

    @GetMapping("/paged")
    public ResponseEntity<Page<ContractResponse>> getAllBuildings(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Page<ContractResponse> responses = contractService.getAllContractPaged(page, size);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/room/{roomId}")
    public ApiResponse<List<ContractResponse>> getByRoom(@PathVariable Integer roomId) {
        return ApiResponse.<List<ContractResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get all contracts by room successfully")
                .result(contractService.getByRoom(roomId))
                .build();
    }

    @GetMapping("/tenant/{tenantId}")
    public ApiResponse<List<ContractResponse>> getByTenant(@PathVariable Integer tenantId) {
        return ApiResponse.<List<ContractResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get all contracts by tenant successfully")
                .result(contractService.getByTenant(tenantId))
                .build();
    }

    @GetMapping("/{contractId}/bills")
    public ApiResponse<List<BillResponse>> getBills(@PathVariable Integer contractId) {
        return ApiResponse.<List<BillResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get bills by contract id successfully")
                .result(contractService.getBillsByContract(contractId))
                .build();
    }

    @PostMapping("/{contractId}/bills")
    public ApiResponse<BillResponse> createBill(@PathVariable Integer contractId, @RequestBody BillRequest request) {
        BillResponse resp = contractService.createBillForContract(contractId, request);
        return ApiResponse.<BillResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Create build by contract Id successfully")
                .result(resp)
                .build();
    }
}
