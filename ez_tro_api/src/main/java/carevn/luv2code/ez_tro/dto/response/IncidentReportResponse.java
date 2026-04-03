package carevn.luv2code.ez_tro.dto.response;

import java.time.LocalDateTime;

import carevn.luv2code.ez_tro.enums.IncidentStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentReportResponse {
    Integer id;
    Integer tenantId;
    Integer roomId;

    String title;

    String description;

    IncidentStatus status;

    String tenantName;

    String roomNumber;

    String buildingName;

    String boardingHouseName;

    String expectedResolveDate;

    String resolveNote;

    LocalDateTime resolvedAt;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;
}
