package carevn.luv2code.ez_tro.service.user.impl;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import carevn.luv2code.ez_tro.dto.response.BillResponse;
import carevn.luv2code.ez_tro.entity.Bill;
import carevn.luv2code.ez_tro.entity.Tenant;
import carevn.luv2code.ez_tro.mapper.BillMapper;
import carevn.luv2code.ez_tro.repository.BillRepository;
import carevn.luv2code.ez_tro.repository.TenantRepository;
import carevn.luv2code.ez_tro.service.user.BillOwnerService;
import lombok.RequiredArgsConstructor;

/**
 * Service lấy hóa đơn (Bill) phía người thuê.
 *
 * <p>Service map từ {@code userId -> tenantId} rồi truy vấn hóa đơn theo tenant.
 */
@Service("ownerBillService")
@RequiredArgsConstructor
public class BillOwnerServiceImpl implements BillOwnerService {

    //    private final BillRepository billRepository;
    //    private final BillMapper billMapper;
    //
    //    @Override
    //    public List<BillResponse> getBillsByUserId(Integer userId) {
    //        List<Bill> bills = billRepository.findByTenantId(userId);
    //        return bills.stream().map(billMapper::toResponse).collect(Collectors.toList());
    //    }

    private final BillRepository billRepository;
    private final BillMapper billMapper;
    private final TenantRepository tenantRepository;

    /**
     * Lấy danh sách hóa đơn theo userId (thông qua tenant).
     *
     * @param userId id user
     * @return danh sách bill DTO
     */
    @Override
    public List<BillResponse> getBillsByUserId(Integer userId) {
        Tenant tenant = tenantRepository
                .findByUserId(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tenant cho user ID: " + userId));

        Integer tenantId = tenant.getId();
        List<Bill> bills = billRepository.findByTenantId(tenantId);

        return bills.stream().map(billMapper::toResponse).collect(Collectors.toList());
    }

    /**
     * Lấy hóa đơn phân trang theo userId.
     *
     * @param userId id user
     * @param pageable phân trang
     * @return page bill DTO
     */
    @Override
    public Page<BillResponse> getBillsByCurrentUser(Integer userId, Pageable pageable) {
        Page<Bill> bills = billRepository.findByTenant_User_Id(userId, pageable);
        return bills.map(billMapper::toResponse);
    }
}
