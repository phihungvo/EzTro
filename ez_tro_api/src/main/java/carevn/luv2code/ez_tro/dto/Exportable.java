package carevn.luv2code.ez_tro.dto;

import java.util.List;

import carevn.luv2code.ez_tro.util.ExcelColumn;

public interface Exportable {
    List<ExcelColumn> getExcelColumns();

    List<?> getData();
}
