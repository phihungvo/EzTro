package carevn.luv2code.ez_tro.service.owner;

import carevn.luv2code.ez_tro.dto.response.TenantRoomInfoResponse;
import carevn.luv2code.ez_tro.dto.response.UserRoomInfoResponse;

public interface UserRoomInfoService {
    TenantRoomInfoResponse getCurrentRoomInfo(Integer userId);
}
