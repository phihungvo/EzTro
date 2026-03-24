package carevn.luv2code.ez_tro.controller.admin;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.FileDTO;
import carevn.luv2code.ez_tro.dto.requests.BillRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractAmendmentCreateRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractBillingRuleCreateRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractRenewRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractRoomTransferRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractTerminateRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractViolationRequest;
import carevn.luv2code.ez_tro.dto.requests.DepositTransactionCreateRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.BillResponse;
import carevn.luv2code.ez_tro.dto.response.ContractAmendmentSummaryResponse;
import carevn.luv2code.ez_tro.dto.response.ContractBillingRuleSummaryResponse;
import carevn.luv2code.ez_tro.dto.response.ContractDetailResponse;
import carevn.luv2code.ez_tro.dto.response.ContractResponse;
import carevn.luv2code.ez_tro.dto.response.ContractRoomTransferResponse;
import carevn.luv2code.ez_tro.dto.response.ContractSnapshotResponse;
import carevn.luv2code.ez_tro.dto.response.ContractVersionSummaryResponse;
import carevn.luv2code.ez_tro.dto.response.DepositTransactionSummaryResponse;
import carevn.luv2code.ez_tro.entity.File;
import carevn.luv2code.ez_tro.mapper.FileMapper;
import carevn.luv2code.ez_tro.repository.FileRepository;
import carevn.luv2code.ez_tro.service.admin.ContractService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;
    private final FileRepository fileRepository;
    private final FileMapper fileMapper;

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
    public ApiResponse<ContractDetailResponse> getById(@PathVariable Integer id) {
        ContractDetailResponse response = contractService.getById(id);
        return ApiResponse.<ContractDetailResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get contract successfully")
                .result(response)
                .build();
    }

    @GetMapping("/{id}/current-version")
    public ApiResponse<ContractVersionSummaryResponse> getCurrentVersion(
            @PathVariable Integer id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        ContractVersionSummaryResponse response = contractService.getCurrentVersion(id, asOfDate);
        return ApiResponse.<ContractVersionSummaryResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get current contract version successfully")
                .result(response)
                .build();
    }

    @GetMapping("/{id}/snapshot")
    public ApiResponse<ContractSnapshotResponse> getSnapshot(
            @PathVariable Integer id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        ContractSnapshotResponse response = contractService.getSnapshot(id, asOfDate);
        return ApiResponse.<ContractSnapshotResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get contract snapshot successfully")
                .result(response)
                .build();
    }

    @PostMapping("/{contractId}/amendments")
    public ApiResponse<ContractAmendmentSummaryResponse> createAmendment(
            @PathVariable Integer contractId, @Valid @RequestBody ContractAmendmentCreateRequest request) {
        ContractAmendmentSummaryResponse response = contractService.createAmendment(contractId, request);
        return ApiResponse.<ContractAmendmentSummaryResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Create contract amendment successfully")
                .result(response)
                .build();
    }

    @PostMapping("/{contractId}/amendments/{amendmentId}/revise")
    public ApiResponse<ContractAmendmentSummaryResponse> reviseAmendment(
            @PathVariable Integer contractId,
            @PathVariable Integer amendmentId,
            @Valid @RequestBody ContractAmendmentCreateRequest request) {
        ContractAmendmentSummaryResponse response = contractService.reviseAmendment(contractId, amendmentId, request);
        return ApiResponse.<ContractAmendmentSummaryResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Revise contract amendment successfully")
                .result(response)
                .build();
    }

    @PostMapping("/{contractId}/billing-rules")
    public ApiResponse<ContractBillingRuleSummaryResponse> createBillingRule(
            @PathVariable Integer contractId, @Valid @RequestBody ContractBillingRuleCreateRequest request) {
        ContractBillingRuleSummaryResponse response = contractService.createBillingRule(contractId, request);
        return ApiResponse.<ContractBillingRuleSummaryResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Create contract billing rule successfully")
                .result(response)
                .build();
    }

    @PostMapping("/{contractId}/billing-rules/{billingRuleId}/revise")
    public ApiResponse<ContractBillingRuleSummaryResponse> reviseBillingRule(
            @PathVariable Integer contractId,
            @PathVariable Integer billingRuleId,
            @Valid @RequestBody ContractBillingRuleCreateRequest request) {
        ContractBillingRuleSummaryResponse response =
                contractService.reviseBillingRule(contractId, billingRuleId, request);
        return ApiResponse.<ContractBillingRuleSummaryResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Revise contract billing rule successfully")
                .result(response)
                .build();
    }

    @PatchMapping("/{contractId}/billing-rules/{billingRuleId}/deactivate")
    public ApiResponse<ContractBillingRuleSummaryResponse> deactivateBillingRule(
            @PathVariable Integer contractId, @PathVariable Integer billingRuleId) {
        ContractBillingRuleSummaryResponse response = contractService.deactivateBillingRule(contractId, billingRuleId);
        return ApiResponse.<ContractBillingRuleSummaryResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Deactivate contract billing rule successfully")
                .result(response)
                .build();
    }

    @PostMapping("/{contractId}/deposit-transactions")
    public ApiResponse<DepositTransactionSummaryResponse> createDepositTransaction(
            @PathVariable Integer contractId, @Valid @RequestBody DepositTransactionCreateRequest request) {
        DepositTransactionSummaryResponse response = contractService.createDepositTransaction(contractId, request);
        return ApiResponse.<DepositTransactionSummaryResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Create deposit transaction successfully")
                .result(response)
                .build();
    }

    @PostMapping("/{contractId}/settlement/finalize")
    public ApiResponse<ContractDetailResponse> finalizeSettlement(@PathVariable Integer contractId) {
        ContractDetailResponse response = contractService.finalizeSettlement(contractId);
        return ApiResponse.<ContractDetailResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Finalize contract settlement successfully")
                .result(response)
                .build();
    }

    @PostMapping("/{contractId}/terminate")
    public ApiResponse<ContractDetailResponse> terminate(
            @PathVariable Integer contractId, @Valid @RequestBody ContractTerminateRequest request) {
        ContractDetailResponse response = contractService.terminate(contractId, request);
        return ApiResponse.<ContractDetailResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Terminate contract successfully")
                .result(response)
                .build();
    }

    @PostMapping("/{contractId}/renew")
    public ApiResponse<ContractDetailResponse> renew(
            @PathVariable Integer contractId, @Valid @RequestBody ContractRenewRequest request) {
        ContractDetailResponse response = contractService.renew(contractId, request);
        return ApiResponse.<ContractDetailResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Renew contract successfully")
                .result(response)
                .build();
    }

    @PostMapping("/{contractId}/mark-violated")
    public ApiResponse<ContractDetailResponse> markViolated(
            @PathVariable Integer contractId, @Valid @RequestBody ContractViolationRequest request) {
        ContractDetailResponse response = contractService.markViolated(contractId, request);
        return ApiResponse.<ContractDetailResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Mark contract violated successfully")
                .result(response)
                .build();
    }

    @PostMapping("/{contractId}/transfer-room")
    public ApiResponse<ContractRoomTransferResponse> transferRoom(
            @PathVariable Integer contractId, @Valid @RequestBody ContractRoomTransferRequest request) {
        ContractRoomTransferResponse response = contractService.transferRoom(contractId, request);
        return ApiResponse.<ContractRoomTransferResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Transfer room successfully")
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

    @GetMapping("/active")
    public ApiResponse<List<ContractResponse>> getAllActiveContracts() {
        List<ContractResponse> activeContracts = contractService.getAllActiveContracts();
        return ApiResponse.<List<ContractResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get all contracts successfully")
                .result(activeContracts)
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

    @GetMapping("/files/{contractId}")
    public ApiResponse<Page<FileDTO>> getContractFiles(@PathVariable Integer contractId, Pageable pageable) {
        contractService.getById(contractId);

        Page<File> filesPage = fileRepository.findByContractIdAndDeletedFalse(contractId, pageable);
        Page<FileDTO> dtoPage = filesPage.map(fileMapper::toDTO);

        return ApiResponse.<Page<FileDTO>>builder()
                .code(HttpStatus.OK.value())
                .message("Files retrieved successfully")
                .result(dtoPage)
                .build();
    }

    @GetMapping("/contracts/{contractId}/count")
    public ResponseEntity<ApiResponse<Long>> getContractFileCount(@PathVariable Integer contractId) {
        contractService.getById(contractId);

        Long count = fileRepository.countByContractIdAndDeletedFalse(contractId);

        return ResponseEntity.ok(ApiResponse.<Long>builder()
                .code(HttpStatus.OK.value())
                .message("File count retrieved successfully")
                .result(count)
                .build());
    }

    // In ContractController.java (or relevant controller)
    @GetMapping("/filter")
    public ResponseEntity<Page<ContractResponse>> filterContracts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer boardingHouseId,
            @RequestParam(required = false) Integer roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ContractResponse> result = contractService.filterContracts(
                search, startDate, endDate, status, boardingHouseId, roomId, page, size);
        return ResponseEntity.ok(result);
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

    @PostMapping("/foundation/backfill")
    public ApiResponse<Integer> backfillContractFoundation() {
        int processed = contractService.backfillContractFoundation();
        return ApiResponse.<Integer>builder()
                .code(HttpStatus.OK.value())
                .message("Contract foundation backfill completed")
                .result(processed)
                .build();
    }
}
