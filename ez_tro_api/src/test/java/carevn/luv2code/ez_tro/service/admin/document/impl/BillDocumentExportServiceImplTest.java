package carevn.luv2code.ez_tro.service.admin.document.impl;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

import carevn.luv2code.ez_tro.dto.response.BillAllocationDetailResponse;
import carevn.luv2code.ez_tro.dto.response.BillDetailResponse;
import carevn.luv2code.ez_tro.dto.response.BillLineDetailResponse;
import carevn.luv2code.ez_tro.enums.BillLifecycleStatus;
import carevn.luv2code.ez_tro.enums.BillLineType;
import carevn.luv2code.ez_tro.enums.BillStatus;
import carevn.luv2code.ez_tro.enums.InvoiceType;
import carevn.luv2code.ez_tro.enums.PaymentAllocationType;
import carevn.luv2code.ez_tro.enums.PaymentStatus;
import carevn.luv2code.ez_tro.service.admin.document.BillDocumentFile;

class BillDocumentExportServiceImplTest {

    private final BillDocumentExportServiceImpl service = new BillDocumentExportServiceImpl(createTemplateEngine());

    @Test
    void exportInvoiceDocument_shouldReturnPdfFile() {
        BillDetailResponse detail = createDetail();

        BillDocumentFile file = service.exportInvoiceDocument(detail);

        assertEquals("application/pdf", file.contentType());
        assertTrue(file.fileName().endsWith(".pdf"));
        assertTrue(file.fileName().contains("hd-2026-04-a101"));
        assertArrayEquals("%PDF-".getBytes(StandardCharsets.US_ASCII), Arrays.copyOf(file.content(), 5));
        assertTrue(file.content().length > 1_000);
    }

    @Test
    void exportReceiptDocument_shouldReturnPdfFile() {
        BillDetailResponse detail = createDetail();

        BillDocumentFile file = service.exportReceiptDocument(detail);

        assertEquals("application/pdf", file.contentType());
        assertTrue(file.fileName().contains("bien-nhan-hd-2026-04-a101"));
        assertTrue(file.fileName().endsWith(".pdf"));
        assertArrayEquals("%PDF-".getBytes(StandardCharsets.US_ASCII), Arrays.copyOf(file.content(), 5));
        assertTrue(file.content().length > 1_000);
    }

    private static SpringTemplateEngine createTemplateEngine() {
        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("mail-templates/");
        resolver.setSuffix(".html");
        resolver.setTemplateMode("HTML");
        resolver.setCharacterEncoding("UTF-8");
        resolver.setCacheable(false);

        SpringTemplateEngine engine = new SpringTemplateEngine();
        engine.addTemplateResolver(resolver);
        return engine;
    }

    private BillDetailResponse createDetail() {
        return BillDetailResponse.builder()
                .id(10)
                .billCode("HD-2026-04-A101")
                .billTitle("Tiền phòng tháng 4")
                .contractCode("HDCT-01")
                .tenantName("Nguyễn Văn A")
                .tenantPhone("0912345678")
                .tenantIdentityNumber("079082099876")
                .roomNumber("A101")
                .roomMaxOccupants(2)
                .boardingHouseName("Nhà Trọ Bình Minh")
                .boardingHouseAddress("123 Lê Văn Việt, TP Thủ Đức")
                .boardingHousePhone("0909123456")
                .ownerName("Nguyễn Văn Chính")
                .ownerPhone("0909123456")
                .ownerEmail("cskh@binhminh.vn")
                .invoiceType(InvoiceType.MANUAL)
                .billingPeriodStart(LocalDate.of(2026, 4, 1))
                .billingPeriodEnd(LocalDate.of(2026, 4, 30))
                .dueDate(LocalDate.of(2026, 4, 15))
                .amount(new BigDecimal("1500000"))
                .allocatedAmount(new BigDecimal("600000"))
                .outstandingAmount(new BigDecimal("900000"))
                .status(BillStatus.PARTIALLY_PAID)
                .lifecycleStatus(BillLifecycleStatus.SENT)
                .paymentInstructions(
                        "Ngân hàng: Vietcombank\nChi nhánh: Thủ Đức\nSố tài khoản: 102045678901\nChủ tài khoản: NGUYEN VAN CHINH\nNội dung CK: HD-2026-04-A101 NGUYEN VAN A")
                .publicNote("Thanh toán trước hạn để tránh phí trễ.")
                .lines(List.of(
                        BillLineDetailResponse.builder()
                                .id(1)
                                .lineType(BillLineType.RENT)
                                .description("Tiền thuê tháng 4/2026")
                                .quantity(BigDecimal.ONE)
                                .unitPrice(new BigDecimal("1200000"))
                                .amount(new BigDecimal("1200000"))
                                .build(),
                        BillLineDetailResponse.builder()
                                .id(2)
                                .lineType(BillLineType.SERVICE)
                                .description("Dịch vụ cố định")
                                .quantity(BigDecimal.ONE)
                                .unitPrice(new BigDecimal("300000"))
                                .amount(new BigDecimal("300000"))
                                .build()))
                .allocations(List.of(BillAllocationDetailResponse.builder()
                        .id(1)
                        .externalReference("CK-0001")
                        .paymentStatus(PaymentStatus.CONFIRMED)
                        .allocationType(PaymentAllocationType.ALLOCATE)
                        .amount(new BigDecimal("600000"))
                        .receivedAt(new Date())
                        .confirmedAt(new Date())
                        .build()))
                .createdAt(new Date())
                .build();
    }
}
