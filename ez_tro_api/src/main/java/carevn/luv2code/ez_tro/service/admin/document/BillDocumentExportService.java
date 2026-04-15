package carevn.luv2code.ez_tro.service.admin.document;

import carevn.luv2code.ez_tro.dto.response.BillDetailResponse;

public interface BillDocumentExportService {
    BillDocumentFile exportInvoiceDocument(BillDetailResponse detail);

    BillDocumentFile exportReceiptDocument(BillDetailResponse detail);
}
