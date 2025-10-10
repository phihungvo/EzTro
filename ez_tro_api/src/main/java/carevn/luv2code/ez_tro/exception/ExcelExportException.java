package carevn.luv2code.ez_tro.exception;

public class ExcelExportException extends RuntimeException {

    public ExcelExportException(String message) {
        super(message);
    }

    public ExcelExportException(String message, Throwable cause) {
        super(message, cause);
    }
}
