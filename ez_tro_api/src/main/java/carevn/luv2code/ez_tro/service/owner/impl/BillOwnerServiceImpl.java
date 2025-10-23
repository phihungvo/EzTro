package carevn.luv2code.ez_tro.service.owner.impl;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import carevn.luv2code.ez_tro.dto.response.BillResponse;
import carevn.luv2code.ez_tro.entity.Bill;
import carevn.luv2code.ez_tro.entity.Tenant;
import carevn.luv2code.ez_tro.mapper.BillMapper;
import carevn.luv2code.ez_tro.repository.BillRepository;
import carevn.luv2code.ez_tro.repository.TenantRepository;
import carevn.luv2code.ez_tro.service.owner.BillOwnerService;
import lombok.RequiredArgsConstructor;

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

    @Override
    public List<BillResponse> getBillsByUserId(Integer userId) {
        // Bước 1: Lấy Tenant từ userId
        Tenant tenant = tenantRepository
                .findByUserId(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tenant cho user ID: " + userId));

        // Bước 2: Lấy tenantId và query bills
        Integer tenantId = tenant.getId();
        List<Bill> bills = billRepository.findByTenantId(tenantId);

        // Bước 3: Map và return
        return bills.stream().map(billMapper::toResponse).collect(Collectors.toList());
    }
}
