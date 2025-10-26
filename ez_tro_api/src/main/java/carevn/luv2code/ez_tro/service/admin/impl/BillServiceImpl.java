package carevn.luv2code.ez_tro.service.admin.impl;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import org.springframework.stereotype.Service;

import carevn.luv2code.ez_tro.dto.requests.BillRequest;
import carevn.luv2code.ez_tro.dto.response.BillResponse;
import carevn.luv2code.ez_tro.entity.Bill;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.Room;
import carevn.luv2code.ez_tro.entity.Tenant;
import carevn.luv2code.ez_tro.enums.BillStatus;
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

        Room room = contract.getRoom();
        Tenant tenant = contract.getTenant();

        BigDecimal rentPrice = contract.getRentPrice();
        BigDecimal serviceAmount = request.getServiceAmount() != null ? request.getServiceAmount() : BigDecimal.ZERO;
        BigDecimal totalAmount = rentPrice.add(serviceAmount);

        Bill bill = mapper.toEntity(request);
        bill.setContract(contract);
        bill.setRoom(room);
        bill.setTenant(tenant);
        bill.setAmount(totalAmount);
        bill.setStatus(BillStatus.UNPAID);
        bill.setCreatedAt(new Date());

        if (bill.getBillCode() == null || bill.getBillCode().isBlank()) {
            String timestamp = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
            bill.setBillCode("BILL-" + timestamp);
        }

        billRepository.save(bill);

        return mapper.toResponse(bill);
    }

    @Override
    public BillResponse update(Integer id, BillRequest request) {
        Bill bill = billRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));

        //        bill.setAmount(request.getAmount());
        //        bill.setPaid(request.getPaid());
        //        bill.setPaymentDate(request.getPaymentDate());

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
