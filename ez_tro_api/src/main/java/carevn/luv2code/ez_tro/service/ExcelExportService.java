package carevn.luv2code.ez_tro.service;

import java.io.ByteArrayInputStream;

public interface ExcelExportService {
    ByteArrayInputStream exportToExcel(String entityType);
}
