package carevn.luv2code.ez_tro.dto.response;

import carevn.luv2code.ez_tro.enums.IncidentStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentReportResponse {
    Integer id;

    String title;

    String description;

    IncidentStatus status;

    String tenantName;

    String roomNumber;
}
