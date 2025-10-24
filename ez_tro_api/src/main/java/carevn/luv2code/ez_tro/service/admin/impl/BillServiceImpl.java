package carevn.luv2code.ez_tro.service.admin.impl;

import static carevn.luv2code.ez_tro.security.SecurityUtils.getCurrentUser;

import java.util.List;

import org.springframework.stereotype.Service;

import carevn.luv2code.ez_tro.dto.requests.BillRequest;
import carevn.luv2code.ez_tro.dto.response.BillResponse;
import carevn.luv2code.ez_tro.entity.Bill;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.Tenant;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.BillMapper;
import carevn.luv2code.ez_tro.repository.BillRepository;
import carevn.luv2code.ez_tro.repository.ContractRepository;
import carevn.luv2code.ez_tro.repository.TenantRepository;
import carevn.luv2code.ez_tro.repository.UserRepository;
import carevn.luv2code.ez_tro.service.admin.BillService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BillServiceImpl implements BillService {

    private final BillRepository billRepository;
    private final ContractRepository contractRepository;
    private final TenantRepository tenantRepository;
    private final BillMapper mapper;
    private final UserRepository userRepository;

    @Override
    public BillResponse create(BillRequest request) {
        Contract contract = contractRepository
                .findById(request.getContractId())
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));

        Bill bill = mapper.toEntity(request);
        bill.setContract(contract);
        bill.setRoom(contract.getRoom());
        Tenant tenant = tenantRepository
                .findByUserId(getCurrentUser().getId())
                .orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_FOUND));

        bill.setTenant(tenant);

        billRepository.save(bill);
        return mapper.toResponse(bill);
    }

    @Override
    public BillResponse update(Integer id, BillRequest request) {
        Bill bill = billRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));

        bill.setAmount(request.getAmount());
        bill.setPaid(request.getPaid());
        bill.setPaymentDate(request.getPaymentDate());

        billRepository.save(bill);
        return mapper.toResponse(bill);
    }

    @Override
    public void delete(Integer id) {
        Bill bill = billRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));
        billRepository.delete(bill);
    }

    @Override
    public BillResponse getById(Integer id) {
        Bill bill = billRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));
        return mapper.toResponse(bill);
    }

    @Override
    public List<BillResponse> getAll() {
        return billRepository.findAll().stream().map(mapper::toResponse).toList();
    }

    //    @Override
    //    public List<BillResponse> getBillsByTenant(Integer tenantId) {
    //        return billRepository.findByTenantId(tenantId)
    //                .stream()
    //                .map(mapper::toResponse)
    //                .toList();
    //    }
}
