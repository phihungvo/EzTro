package carevn.luv2code.ez_tro.service.admin;

import java.io.ByteArrayInputStream;

/**
 * Service contract export dữ liệu ra file Excel.
 */
public interface ExcelExportService {
    ByteArrayInputStream exportToExcel(String entityType);
}
