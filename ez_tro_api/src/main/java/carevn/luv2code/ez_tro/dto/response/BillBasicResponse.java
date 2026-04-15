package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.sql.Date;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BillBasicResponse {
    private Integer id;
    private String code;
    private Integer month;
    private Integer year;
    private BigDecimal total;
    private Date issueDate;
}
