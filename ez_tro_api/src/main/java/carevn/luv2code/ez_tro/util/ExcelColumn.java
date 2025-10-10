package carevn.luv2code.ez_tro.util;

public class ExcelColumn {

    private final String header;
    private final String fieldName;
    private final Class<?> fieldType;

    public ExcelColumn(String header, String fieldName, Class<?> fieldType) {
        this.header = header;
        this.fieldName = fieldName;
        this.fieldType = fieldType;
    }

    public String getHeader() {
        return header;
    }

    public String getFieldName() {
        return fieldName;
    }

    public Class<?> getFieldType() {
        return fieldType;
    }
}
