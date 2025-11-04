package carevn.luv2code.ez_tro.service.user;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import carevn.luv2code.ez_tro.dto.response.BillResponse;

public interface BillOwnerService {
    List<BillResponse> getBillsByUserId(Integer userId);

    Page<BillResponse> getBillsByCurrentUser(Integer userId, Pageable pageable);
}
