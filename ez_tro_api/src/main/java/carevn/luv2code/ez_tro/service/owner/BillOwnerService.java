package carevn.luv2code.ez_tro.service.owner;

import java.util.List;

import carevn.luv2code.ez_tro.dto.response.BillResponse;

public interface BillOwnerService {
    List<BillResponse> getBillsByUserId(Integer userId);
}
