package carevn.luv2code.ez_tro.service.admin;

import java.time.LocalDate;

import carevn.luv2code.ez_tro.dto.requests.InvoiceFinalizeRequest;
import carevn.luv2code.ez_tro.dto.requests.InvoicePreviewRequest;
import carevn.luv2code.ez_tro.dto.response.BillResponse;
import carevn.luv2code.ez_tro.dto.response.InvoicePreviewResponse;

/**
 * Service contract cho nghiệp vụ tính tiền/lập hóa đơn (billing orchestrator).
 */
public interface BillingOrchestratorService {
    InvoicePreviewResponse previewInvoice(InvoicePreviewRequest request);

    BillResponse finalizeInvoice(InvoiceFinalizeRequest request);

    int generateInvoices(LocalDate asOfDate);

    int applyLatePenalties(LocalDate asOfDate);
}
