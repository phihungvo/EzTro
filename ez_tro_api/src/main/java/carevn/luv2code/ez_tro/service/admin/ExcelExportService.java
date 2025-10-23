package carevn.luv2code.ez_tro.service.admin;

import java.io.ByteArrayInputStream;

public interface ExcelExportService {
    ByteArrayInputStream exportToExcel(String entityType);
}
