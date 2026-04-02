package carevn.luv2code.ez_tro.controller.user;

import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import carevn.luv2code.ez_tro.dto.FileDTO;
import carevn.luv2code.ez_tro.dto.requests.BillPaymentSubmissionRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.BillDetailResponse;
import carevn.luv2code.ez_tro.dto.response.BillResponse;
import carevn.luv2code.ez_tro.dto.response.PaymentResponse;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.document.BillDocumentExportService;
import carevn.luv2code.ez_tro.service.admin.document.BillDocumentFile;
import carevn.luv2code.ez_tro.service.user.BillOwnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST Controller hóa đơn (Bill) phía người thuê.
 *
 * <p>Các endpoint ở đây mặc định lấy {@code userId} từ {@link SecurityUtils} và chỉ trả về dữ liệu của chính user đó.
 */
@RestController
@RequestMapping("/api/user/bills")
@RequiredArgsConstructor
public class BillUserController {

    private final BillOwnerService billService;
    private final BillDocumentExportService billDocumentExportService;

    /**
     * Lấy danh sách hóa đơn của user hiện tại (không phân trang).
     *
     * @return response chứa danh sách hóa đơn
     */
    @GetMapping
    public ApiResponse<List<BillResponse>> getMyBills() {
        Integer userId = SecurityUtils.getCurrentUserId();
        List<BillResponse> responses = billService.getBillsByUserId(userId);
        return ApiResponse.<List<BillResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách hóa đơn thành công")
                .result(responses)
                .build();
    }

    /**
     * Lấy danh sách hóa đơn của user hiện tại (phân trang).
     *
     * @param page trang (0-based)
     * @param size kích thước trang
     * @return response chứa page hóa đơn
     */
    @GetMapping("/paged")
    public ApiResponse<Page<BillResponse>> getUserBills(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Integer userId = SecurityUtils.getCurrentUserId();
        Page<BillResponse> bills = billService.getBillsByCurrentUser(userId, PageRequest.of(page, size));
        return ApiResponse.<Page<BillResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách hóa đơn thành công")
                .result(bills)
                .build();
    }

    @GetMapping("/{billId}")
    public ApiResponse<BillDetailResponse> getBillDetail(@PathVariable Integer billId) {
        Integer userId = SecurityUtils.getCurrentUserId();
        BillDetailResponse response = billService.getBillDetailByCurrentUser(userId, billId);
        return ApiResponse.<BillDetailResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy chi tiết hóa đơn thành công")
                .result(response)
                .build();
    }

    @GetMapping("/{billId}/document")
    public ResponseEntity<Resource> downloadBillDocument(@PathVariable Integer billId) {
        Integer userId = SecurityUtils.getCurrentUserId();
        BillDetailResponse detail = billService.getBillDetailByCurrentUser(userId, billId);
        BillDocumentFile file = billDocumentExportService.exportInvoiceDocument(detail);
        return buildDocumentResponse(file);
    }

    @GetMapping("/{billId}/receipt")
    public ResponseEntity<Resource> downloadBillReceipt(@PathVariable Integer billId) {
        Integer userId = SecurityUtils.getCurrentUserId();
        BillDetailResponse detail = billService.getBillDetailByCurrentUser(userId, billId);
        BillDocumentFile file = billDocumentExportService.exportReceiptDocument(detail);
        return buildDocumentResponse(file);
    }

    @PostMapping(value = "/{billId}/proof-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<FileDTO> uploadPaymentProof(
            @PathVariable Integer billId, @RequestParam("file") MultipartFile file) {
        Integer userId = SecurityUtils.getCurrentUserId();
        FileDTO response = billService.uploadPaymentProofByCurrentUser(userId, billId, file);
        return ApiResponse.<FileDTO>builder()
                .code(HttpStatus.CREATED.value())
                .message("Tải chứng từ thanh toán thành công")
                .result(response)
                .build();
    }

    @PostMapping("/{billId}/payments")
    public ApiResponse<PaymentResponse> submitPayment(
            @PathVariable Integer billId, @Valid @RequestBody BillPaymentSubmissionRequest request) {
        Integer userId = SecurityUtils.getCurrentUserId();
        PaymentResponse response = billService.submitPaymentByCurrentUser(userId, billId, request);
        return ApiResponse.<PaymentResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Gửi xác nhận thanh toán thành công")
                .result(response)
                .build();
    }

    private ResponseEntity<Resource> buildDocumentResponse(BillDocumentFile file) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename(file.fileName(), StandardCharsets.UTF_8)
                .build());
        return ResponseEntity.ok()
                .headers(headers)
                .contentLength(file.content().length)
                .contentType(MediaType.parseMediaType(file.contentType()))
                .body(new ByteArrayResource(file.content()));
    }
}
