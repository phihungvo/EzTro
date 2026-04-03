package carevn.luv2code.ez_tro.dto.response;

import java.math.BigDecimal;
import java.util.Date;

import carevn.luv2code.ez_tro.enums.BillTimelineEventType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillTimelineEventResponse {
    String eventKey;
    BillTimelineEventType eventType;
    String title;
    String description;
    String actorName;
    BigDecimal amount;
    Date occurredAt;
}
