package carevn.luv2code.ez_tro.service.user;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import carevn.luv2code.ez_tro.dto.FileDTO;
import carevn.luv2code.ez_tro.dto.requests.BillPaymentSubmissionRequest;
import carevn.luv2code.ez_tro.dto.response.BillDetailResponse;
import carevn.luv2code.ez_tro.dto.response.BillResponse;
import carevn.luv2code.ez_tro.dto.response.PaymentResponse;

/**
 * Service contract truy vấn hóa đơn phía người thuê.
 */
public interface BillOwnerService {
    List<BillResponse> getBillsByUserId(Integer userId);

    Page<BillResponse> getBillsByCurrentUser(Integer userId, Pageable pageable);

    BillDetailResponse getBillDetailByCurrentUser(Integer userId, Integer billId);

    FileDTO uploadPaymentProofByCurrentUser(Integer userId, Integer billId, MultipartFile file);

    PaymentResponse submitPaymentByCurrentUser(Integer userId, Integer billId, BillPaymentSubmissionRequest request);
}
