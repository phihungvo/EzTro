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

/**
 * REST Controller cho nghiệp vụ Hợp đồng (Contract) phía admin/owner.
 *
 * <p>Lớp này chủ yếu:
 * <ul>
 *   <li>Nhận request + validate (@Valid) và chuyển xuống {@link ContractService} xử lý nghiệp vụ.</li>
 *   <li>Đóng gói response theo {@link ApiResponse} để thống nhất format API.</li>
 * </ul>
 *
 * <p>Ghi chú: Controller cố tình mỏng; các rule nghiệp vụ (versioning, settlement, proration, idempotency...)
 * nằm ở tầng service.
 */
@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;
    private final FileRepository fileRepository;
    private final FileMapper fileMapper;

    /**
     * Tạo mới hợp đồng.
     *
     * @param request payload tạo hợp đồng (roomId, tenant, điều khoản tài chính...)
     * @return response chứa hợp đồng vừa tạo
     */
    @PostMapping
    public ApiResponse<ContractResponse> create(@Valid @RequestBody ContractRequest request) {
        ContractResponse response = contractService.create(request);
        return ApiResponse.<ContractResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Contract created successfully")
                .result(response)
                .build();
    }

    /**
     * Cập nhật hợp đồng theo id.
     *
     * <p>Một số field bị giới hạn cập nhật ở tầng service (ví dụ: không cho đổi room/tenant qua API update).
     *
     * @param id id hợp đồng
     * @param request payload cập nhật hợp đồng
     * @return response chứa hợp đồng sau khi cập nhật
     */
    @PutMapping("/{id}")
    public ApiResponse<ContractResponse> update(@PathVariable Integer id, @Valid @RequestBody ContractRequest request) {
        ContractResponse response = contractService.update(id, request);
        return ApiResponse.<ContractResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Contract updated successfully")
                .result(response)
                .build();
    }

    /**
     * Xóa hợp đồng theo id.
     *
     * <p>Sau khi xóa, service sẽ đồng bộ lại trạng thái phòng (AVAILABLE/OCCUPIED) theo hợp đồng còn hiệu lực.
     *
     * @param id id hợp đồng cần xóa
     * @return response không có payload
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        contractService.delete(id);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.NO_CONTENT.value())
                .message("Contract deleted successfully")
                .build();
    }

    /**
     * Lấy chi tiết hợp đồng theo id.
     *
     * @param id id hợp đồng
     * @return response chứa chi tiết hợp đồng (bao gồm các thông tin mở rộng tùy theo service)
     */
    @GetMapping("/{id}")
    public ApiResponse<ContractDetailResponse> getById(@PathVariable Integer id) {
        ContractDetailResponse response = contractService.getById(id);
        return ApiResponse.<ContractDetailResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get contract successfully")
                .result(response)
                .build();
    }

    /**
     * Lấy version điều khoản đang hiệu lực tại một thời điểm.
     *
     * @param id id hợp đồng
     * @param asOfDate ngày muốn tra version (ISO yyyy-MM-dd). Nếu không truyền thì service tự dùng "hôm nay"
     * @return response chứa version summary
     */
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

    /**
     * Lấy snapshot hợp đồng tại một thời điểm (gộp contract + version + rule + ledger...).
     *
     * @param id id hợp đồng
     * @param asOfDate ngày muốn dựng snapshot (ISO yyyy-MM-dd). Nếu không truyền thì mặc định "hôm nay"
     * @return response chứa snapshot
     */
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

    /**
     * Tạo amendment cho hợp đồng (phụ lục/điều chỉnh).
     *
     * <p>Amendment dùng để ghi nhận thay đổi theo khoảng thời gian hiệu lực; nếu payload có override điều khoản
     * (giá thuê/cọc/kỳ thanh toán...) thì service có thể tự tạo {@code ContractVersion} mới để giữ lịch sử.
     *
     * @param contractId id hợp đồng
     * @param request payload amendment (effectiveFrom/effectiveTo + data)
     * @return response chứa amendment summary
     */
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

    /**
     * Revise (tạo bản sửa) cho một amendment hiện có.
     *
     * <p>Service sẽ "đóng" amendment cũ (set effectiveTo) và tạo một amendment mới bắt đầu từ effectiveFrom mới,
     * giúp giữ được lịch sử thay đổi.
     *
     * @param contractId id hợp đồng
     * @param amendmentId id amendment cần revise
     * @param request payload amendment mới
     * @return response chứa amendment summary sau khi revise
     */
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

    /**
     * Tạo billing rule cho hợp đồng (quy tắc tính phí theo utility).
     *
     * @param contractId id hợp đồng
     * @param request payload rule (utilityId, effectiveFrom/effectiveTo, cách tính...)
     * @return response chứa rule summary
     */
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

    /**
     * Revise (tạo bản sửa) cho một billing rule.
     *
     * <p>Service sẽ deactivate rule cũ và tạo rule mới với ngày hiệu lực bắt đầu mới để không mất lịch sử.
     *
     * @param contractId id hợp đồng
     * @param billingRuleId id billing rule cần revise
     * @param request payload rule mới
     * @return response chứa rule summary sau khi revise
     */
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

    /**
     * Deactivate một billing rule (tắt hiệu lực).
     *
     * @param contractId id hợp đồng
     * @param billingRuleId id billing rule
     * @return response chứa rule summary sau khi deactivate
     */
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

    /**
     * Tạo giao dịch sổ cọc (deposit ledger) cho hợp đồng.
     *
     * @param contractId id hợp đồng
     * @param request payload giao dịch (loại giao dịch, số tiền, tham chiếu...)
     * @return response chứa thông tin giao dịch vừa tạo
     */
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

    /**
     * Chốt quyết toán hợp đồng (settlement): khấu trừ hóa đơn mở bằng tiền cọc và/hoặc hoàn cọc.
     *
     * @param contractId id hợp đồng
     * @return response chứa chi tiết hợp đồng sau khi settlement
     */
    @PostMapping("/{contractId}/settlement/finalize")
    public ApiResponse<ContractDetailResponse> finalizeSettlement(@PathVariable Integer contractId) {
        ContractDetailResponse response = contractService.finalizeSettlement(contractId);
        return ApiResponse.<ContractDetailResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Finalize contract settlement successfully")
                .result(response)
                .build();
    }

    /**
     * Chấm dứt hợp đồng theo ngày.
     *
     * <p>Service có thể tạo hóa đơn prorate (tính theo ngày ở thực tế) để chốt phần tiền thuê của tháng.
     *
     * @param contractId id hợp đồng
     * @param request payload chấm dứt (terminationDate + note)
     * @return response chứa chi tiết hợp đồng sau khi chấm dứt
     */
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

    /**
     * Gia hạn hợp đồng.
     *
     * @param contractId id hợp đồng
     * @param request payload gia hạn (ngày bắt đầu hiệu lực, ngày kết thúc mới, note...)
     * @return response chứa chi tiết hợp đồng sau gia hạn
     */
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

    /**
     * Đánh dấu hợp đồng vi phạm.
     *
     * @param contractId id hợp đồng
     * @param request payload vi phạm (reason + evidence)
     * @return response chứa chi tiết hợp đồng sau khi đánh dấu
     */
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

    /**
     * Chuyển phòng: kết thúc hợp đồng ở phòng cũ và tạo hợp đồng mới ở phòng đích.
     *
     * <p>Có thể chọn chuyển tiền cọc sang hợp đồng mới (tùy rule ở service).
     *
     * @param contractId id hợp đồng nguồn
     * @param request payload chuyển phòng (targetRoomId, transferDate, có chuyển cọc hay không...)
     * @return response chứa thông tin hợp đồng mới tạo
     */
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

    /**
     * Lấy danh sách tất cả hợp đồng mà user hiện tại có quyền xem.
     *
     * @return response danh sách hợp đồng
     */
    @GetMapping
    public ApiResponse<List<ContractResponse>> getAll() {
        List<ContractResponse> responses = contractService.getAll();
        return ApiResponse.<List<ContractResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get all contracts successfully")
                .result(responses)
                .build();
    }

    /**
     * Lấy danh sách hợp đồng đang active (lọc theo quyền).
     *
     * @return response danh sách hợp đồng active
     */
    @GetMapping("/active")
    public ApiResponse<List<ContractResponse>> getAllActiveContracts() {
        List<ContractResponse> activeContracts = contractService.getAllActiveContracts();
        return ApiResponse.<List<ContractResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get all contracts successfully")
                .result(activeContracts)
                .build();
    }

    /**
     * Lấy danh sách hợp đồng dạng phân trang.
     *
     * @param page số trang (0-based)
     * @param size kích thước trang
     * @return {@link Page} hợp đồng (ResponseEntity để trả trực tiếp cấu trúc Page)
     */
    @GetMapping("/paged")
    public ResponseEntity<Page<ContractResponse>> getAllBuildings(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Page<ContractResponse> responses = contractService.getAllContractPaged(page, size);
        return ResponseEntity.ok(responses);
    }

    /**
     * Lấy danh sách hợp đồng theo phòng.
     *
     * @param roomId id phòng
     * @return response danh sách hợp đồng của phòng
     */
    @GetMapping("/room/{roomId}")
    public ApiResponse<List<ContractResponse>> getByRoom(@PathVariable Integer roomId) {
        return ApiResponse.<List<ContractResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get all contracts by room successfully")
                .result(contractService.getByRoom(roomId))
                .build();
    }

    /**
     * Lấy danh sách hợp đồng theo tenant.
     *
     * @param tenantId id tenant
     * @return response danh sách hợp đồng của tenant
     */
    @GetMapping("/tenant/{tenantId}")
    public ApiResponse<List<ContractResponse>> getByTenant(@PathVariable Integer tenantId) {
        return ApiResponse.<List<ContractResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get all contracts by tenant successfully")
                .result(contractService.getByTenant(tenantId))
                .build();
    }

    /**
     * Lấy danh sách hóa đơn của một hợp đồng.
     *
     * @param contractId id hợp đồng
     * @return response danh sách hóa đơn
     */
    @GetMapping("/{contractId}/bills")
    public ApiResponse<List<BillResponse>> getBills(@PathVariable Integer contractId) {
        return ApiResponse.<List<BillResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get bills by contract id successfully")
                .result(contractService.getBillsByContract(contractId))
                .build();
    }

    /**
     * Lấy danh sách file đính kèm theo hợp đồng (phân trang).
     *
     * <p>Lưu ý: gọi {@link ContractService#getById(Integer)} để đảm bảo hợp đồng tồn tại và user có quyền truy cập,
     * sau đó mới query file.
     *
     * @param contractId id hợp đồng
     * @param pageable tham số phân trang/sort do Spring cung cấp
     * @return response chứa page file DTO
     */
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

    /**
     * Đếm số file đính kèm của hợp đồng.
     *
     * @param contractId id hợp đồng
     * @return response chứa số lượng file chưa bị xóa mềm
     */
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

    /**
     * Lọc hợp đồng theo nhiều tiêu chí.
     *
     * <p>Các tham số ngày ({@code startDate}, {@code endDate}) hiện được truyền dạng string ISO và parse ở service.
     *
     * @param search chuỗi tìm kiếm (mã hợp đồng / số phòng / tên tenant)
     * @param startDate ngày bắt đầu (yyyy-MM-dd)
     * @param endDate ngày kết thúc (yyyy-MM-dd)
     * @param status trạng thái hợp đồng (hoặc ALL)
     * @param boardingHouseId lọc theo nhà trọ
     * @param roomId lọc theo phòng
     * @param page số trang (0-based)
     * @param size kích thước trang
     * @return page hợp đồng thỏa điều kiện
     */
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

    /**
     * Tạo hóa đơn thủ công cho một hợp đồng.
     *
     * <p>Ghi chú: Đây là flow tạo bill trực tiếp theo payload; không phải "billing orchestration" tự động.
     *
     * @param contractId id hợp đồng
     * @param request payload tạo bill
     * @return response chứa bill vừa tạo
     */
    @PostMapping("/{contractId}/bills")
    public ApiResponse<BillResponse> createBill(@PathVariable Integer contractId, @RequestBody BillRequest request) {
        BillResponse resp = contractService.createBillForContract(contractId, request);
        return ApiResponse.<BillResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Create build by contract Id successfully")
                .result(resp)
                .build();
    }

    /**
     * Endpoint kỹ thuật để backfill dữ liệu contract cho các record legacy (organization, version, ledger...).
     *
     * @return số lượng contract được xử lý
     */
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
