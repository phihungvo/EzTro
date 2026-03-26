package carevn.luv2code.ez_tro.service.user;

import carevn.luv2code.ez_tro.dto.response.CurrentRentalInfoResponse;
import carevn.luv2code.ez_tro.dto.response.TenantRoomInfoResponse;

/**
 * Service contract cung cấp thông tin phòng/hợp đồng hiện tại cho người thuê.
 */
public interface UserRoomInfoService {
    TenantRoomInfoResponse getCurrentRoomInfo(Integer userId);

    CurrentRentalInfoResponse getCurrentContractInfo(Integer userId);
}
