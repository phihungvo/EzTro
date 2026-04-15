package carevn.luv2code.ez_tro.controller.admin;

import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import carevn.luv2code.ez_tro.service.admin.ExcelExportService;
import jakarta.validation.constraints.NotBlank;

/**
 * REST Controller export dữ liệu ra file Excel.
 *
 * <p>Endpoint trả về file dạng {@code .xlsx} thông qua {@link InputStreamResource}.
 */
@RestController
@RequestMapping("/api/export")
public class ExcelExportController {

    private final ExcelExportService excelExportService;

    public ExcelExportController(ExcelExportService excelExportService) {
        this.excelExportService = excelExportService;
    }

    /**
     * Export dữ liệu theo {@code entityType} và trả về file Excel để download.
     *
     * @param entityType loại entity muốn export (ví dụ: user, boarding_house)
     * @return response chứa stream file Excel
     */
    @GetMapping("/excel")
    public ResponseEntity<Resource> exportToExcel(@RequestParam @NotBlank String entityType) {
        ByteArrayInputStream in = excelExportService.exportToExcel(entityType);

        String filename =
                entityType + "_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".xlsx";
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename);

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }
}
