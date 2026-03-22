package carevn.luv2code.ez_tro.dto.response;

import java.time.LocalDateTime;

import carevn.luv2code.ez_tro.enums.PropertyAssetAction;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyAssetHistoryResponse {
    Integer id;
    PropertyAssetAction action;
    LocalDateTime actionDate;
    String performedBy;
    String note;
}
