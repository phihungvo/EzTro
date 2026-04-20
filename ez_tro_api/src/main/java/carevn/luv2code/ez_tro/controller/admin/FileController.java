package carevn.luv2code.ez_tro.controller.admin;

import java.io.InputStream;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import carevn.luv2code.ez_tro.configuration.MinioService;
import carevn.luv2code.ez_tro.dto.FileDTO;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.entity.File;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.repository.FileRepository;
import carevn.luv2code.ez_tro.repository.UserRepository;
import io.minio.StatObjectResponse;
import lombok.RequiredArgsConstructor;

/**
 * REST Controller quản lý file (upload/download/presigned URL) qua MinIO.
 *
 * <p>Controller hiện hỗ trợ:
 * <ul>
 *   <li>Upload file đính kèm cho hợp đồng.</li>
 *   <li>Lấy presigned URL để view/download trực tiếp từ storage.</li>
 *   <li>Download file qua backend, xóa file, và một số utility endpoint (list/exists/metadata/copy/move).</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final MinioService minioService;

    private final UserRepository userRepository;

    private final FileRepository fileRepository;

    /**
     * Upload nhiều file cho một hợp đồng.
     *
     * @param contractId id hợp đồng
     * @param files danh sách file upload (multipart)
     * @return response chứa danh sách file đã upload (metadata)
     */
    @PostMapping("/upload/contract/{contractId}")
    public ResponseEntity<ApiResponse<List<FileDTO>>> uploadContractFiles(
            @PathVariable Integer contractId, @RequestParam("files") MultipartFile[] files) {

        if (files == null || files.length == 0) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.<List<FileDTO>>builder()
                            .code(HttpStatus.BAD_REQUEST.value())
                            .message("No files uploaded. Please attach at least one file.")
                            .result(null)
                            .build());
        }

        try {
            // Lấy user hiện tại (người upload)
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext()
                    .getAuthentication();
            var uploadedBy = userRepository
                    .findByUserName(auth.getName())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

            // Gọi service upload
            List<FileDTO> uploadedFiles = minioService.uploadFilesForContract(files, uploadedBy, contractId);

            return ResponseEntity.ok(ApiResponse.<List<FileDTO>>builder()
                    .code(HttpStatus.OK.value())
                    .message("Upload contract files successfully")
                    .result(uploadedFiles)
                    .build());

        } catch (AppException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<List<FileDTO>>builder()
                            .code(e.getErrorCode().getCode())
                            .message(e.getErrorCode().getMessage())
                            .result(null)
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<FileDTO>>builder()
                            .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                            .message("Unexpected error: " + e.getMessage())
                            .result(null)
                            .build());
        }
    }

    /**
     * Lấy presigned URL cho file để view/download trực tiếp từ MinIO.
     *
     * @param fileId id file (DB)
     * @param action hành động: "view" hoặc "download"
     * @return response chứa presigned URL
     */
    @GetMapping("/{fileId}/presigned-url")
    public ResponseEntity<ApiResponse<String>> getPresignedUrl(
            @PathVariable Integer fileId, @RequestParam(defaultValue = "view") String action) { // "view" or "download"

        try {
            File existingFile = fileRepository
                    .findByIdAndIsDeletedFalse(fileId)
                    .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));
            if (!minioService.fileExists(existingFile.getFileName())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.<String>builder()
                                .code(HttpStatus.NOT_FOUND.value())
                                .message("File not found in storage: " + existingFile.getFileName())
                                .result(null)
                                .build());
            }

            int expirySeconds = 3600; // 1 hour
            String presignedUrl = minioService.generatePresignedUrl(existingFile.getFileName(), action, expirySeconds);

            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .code(HttpStatus.OK.value())
                    .message("Presigned URL generated successfully")
                    .result(presignedUrl)
                    .build());
        } catch (AppException e) {
            return ResponseEntity.status(e.getErrorCode().getCode())
                    .body(ApiResponse.<String>builder()
                            .code(e.getErrorCode().getCode())
                            .message(e.getErrorCode().getMessage())
                            .result(null)
                            .build());
        }
    }

    /**
     * Download file theo {@code fileId}.
     *
     * @param fileId id file (DB)
     * @return response body là byte[] hoặc message lỗi
     */
    @GetMapping("/{fileId}/download")
    public ResponseEntity<?> downloadFile(@PathVariable Integer fileId) {
        try {
            File file = fileRepository
                    .findByIdAndIsDeletedFalse(fileId)
                    .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

            try (InputStream inputStream = minioService.downloadFile(file.getFileName())) {
                byte[] fileContent = inputStream.readAllBytes();
                return ResponseEntity.ok()
                        .header(
                                HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\"" + file.getOriginalName() + "\"")
                        .header(HttpHeaders.CONTENT_TYPE, file.getContentType())
                        .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(fileContent.length))
                        .body(fileContent);
            }
        } catch (AppException e) {
            return ResponseEntity.status(e.getErrorCode().getCode()).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error downloading file: " + e.getMessage());
        }
    }

    /**
     * Xóa file theo {@code fileId} (storage + DB soft delete tùy theo MinioService).
     *
     * @param fileId id file (DB)
     * @return response 204 nếu xóa thành công
     */
    @DeleteMapping("/{fileId}")
    public ResponseEntity<ApiResponse<Void>> deleteFile(@PathVariable Integer fileId) {
        try {
            File file = fileRepository
                    .findByIdAndIsDeletedFalse(fileId)
                    .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

            minioService.deleteFile(file.getFileName());

            return ResponseEntity.noContent().build();
        } catch (AppException e) {
            return ResponseEntity.status(e.getErrorCode().getCode())
                    .body(ApiResponse.<Void>builder()
                            .code(e.getErrorCode().getCode())
                            .message(e.getErrorCode().getMessage())
                            .result(null)
                            .build());
        }
    }

    /**
     * Liệt kê các file object trong bucket (debug/admin).
     *
     * @return danh sách object name
     */
    @GetMapping("/list")
    public ResponseEntity<List<String>> listFiles() {
        List<String> fileNames = minioService.listFiles();
        return ResponseEntity.ok(fileNames);
    }

    /**
     * Kiểm tra object có tồn tại trong storage hay không.
     *
     * @param fileName object name
     * @return true nếu tồn tại
     */
    @GetMapping("/exists/{fileName}")
    public ResponseEntity<Boolean> fileExists(@PathVariable String fileName) {
        boolean exists = minioService.fileExists(fileName);
        return ResponseEntity.ok(exists);
    }

    /**
     * Lấy metadata của object trong MinIO.
     *
     * @param fileName object name
     * @return metadata từ MinIO
     */
    @GetMapping("/metadata/{fileName}")
    public ResponseEntity<StatObjectResponse> getFileMetadata(@PathVariable String fileName) {
        StatObjectResponse metadata = minioService.getFileMetadata(fileName);
        return ResponseEntity.ok(metadata);
    }

    /**
     * Copy object trong MinIO.
     *
     * @param sourceFileName object source
     * @param targetFileName object target
     * @return response 200 nếu copy thành công
     */
    @PostMapping("/copy")
    public ResponseEntity<Void> copyFile(@RequestParam String sourceFileName, @RequestParam String targetFileName) {
        if (sourceFileName.isBlank() || targetFileName.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        minioService.copyFile(sourceFileName, targetFileName);
        return ResponseEntity.ok().build();
    }

    /**
     * Move object trong MinIO (copy + delete source).
     *
     * @param sourceFileName object source
     * @param targetFileName object target
     * @return response 200 nếu move thành công
     */
    @PostMapping("/move")
    public ResponseEntity<Void> moveFile(@RequestParam String sourceFileName, @RequestParam String targetFileName) {
        if (sourceFileName.isBlank() || targetFileName.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        minioService.moveFile(sourceFileName, targetFileName);
        return ResponseEntity.ok().build();
    }
}
