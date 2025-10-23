package carevn.luv2code.ez_tro.controller.user;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.BillResponse;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.owner.BillOwnerService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/bills")
@RequiredArgsConstructor
public class BillUserController {

    private final BillOwnerService billService;

    @GetMapping
    public ApiResponse<List<BillResponse>> getMyBills() {
        Integer userId = SecurityUtils.getCurrentUserId();
        List<BillResponse> responses = billService.getBillsByUserId(userId);
        return ApiResponse.<List<BillResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách hóa đơn thành công")
                .result(responses)
                .build();
    }
}
