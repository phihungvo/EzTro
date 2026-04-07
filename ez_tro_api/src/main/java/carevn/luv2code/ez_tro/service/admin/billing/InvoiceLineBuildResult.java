package carevn.luv2code.ez_tro.service.admin.billing;

import java.math.BigDecimal;
import java.util.List;

import carevn.luv2code.ez_tro.entity.BillLine;
import lombok.*;

/**
 * Kết quả build line items cho một invoice/bill.
 *
 * <p>Bao gồm danh sách {@link BillLine} và các giá trị tổng hợp (rent/service/discount/penalty).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceLineBuildResult {
    List<BillLine> lines;
    BigDecimal totalAmount;
    BigDecimal rentAmount;
    BigDecimal serviceAmount;
    BigDecimal discountAmount;
    BigDecimal penaltyAmount;
    boolean hasMissingMeterReadings;
}
