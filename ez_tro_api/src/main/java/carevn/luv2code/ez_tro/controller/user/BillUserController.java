package carevn.luv2code.ez_tro.controller.user;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.BillResponse;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.user.BillOwnerService;
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

    @GetMapping("/paged")
    public ApiResponse<Page<BillResponse>> getUserBills(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Integer userId = SecurityUtils.getCurrentUserId();
        Page<BillResponse> bills = billService.getBillsByCurrentUser(userId, PageRequest.of(page, size));
        return ApiResponse.<Page<BillResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách hóa đơn thành công")
                .result(bills)
                .build();
    }
}
