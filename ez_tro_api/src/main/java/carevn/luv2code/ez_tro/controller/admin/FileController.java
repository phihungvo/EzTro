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

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final MinioService minioService;

    private final UserRepository userRepository;

    private final FileRepository fileRepository;

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

    @GetMapping("/list")
    public ResponseEntity<List<String>> listFiles() {
        List<String> fileNames = minioService.listFiles();
        return ResponseEntity.ok(fileNames);
    }

    @GetMapping("/exists/{fileName}")
    public ResponseEntity<Boolean> fileExists(@PathVariable String fileName) {
        boolean exists = minioService.fileExists(fileName);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/metadata/{fileName}")
    public ResponseEntity<StatObjectResponse> getFileMetadata(@PathVariable String fileName) {
        StatObjectResponse metadata = minioService.getFileMetadata(fileName);
        return ResponseEntity.ok(metadata);
    }

    @PostMapping("/copy")
    public ResponseEntity<Void> copyFile(@RequestParam String sourceFileName, @RequestParam String targetFileName) {
        if (sourceFileName.isBlank() || targetFileName.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        minioService.copyFile(sourceFileName, targetFileName);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/move")
    public ResponseEntity<Void> moveFile(@RequestParam String sourceFileName, @RequestParam String targetFileName) {
        if (sourceFileName.isBlank() || targetFileName.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        minioService.moveFile(sourceFileName, targetFileName);
        return ResponseEntity.ok().build();
    }
}
