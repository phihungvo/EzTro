package carevn.luv2code.ez_tro.service.user.impl;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.response.MeterReadingResponse;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.enums.ContractStatus;
import carevn.luv2code.ez_tro.mapper.MeterReadingMapper;
import carevn.luv2code.ez_tro.repository.ContractRepository;
import carevn.luv2code.ez_tro.repository.MeterReadingRepository;
import carevn.luv2code.ez_tro.service.user.UserUtilityService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class UserUtilityServiceImpl implements UserUtilityService {

    private final ContractRepository contractRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final MeterReadingMapper meterReadingMapper;

    /**
     * Lấy thông tin my meter readings by period.
     */
    @Override
    @Transactional(readOnly = true)
    public List<MeterReadingResponse> getMyMeterReadingsByPeriod(Integer userId, Integer month, Integer year) {
        Contract contract = resolveActiveContract(userId);

        if (contract == null || contract.getRoom() == null || contract.getRoom().getId() == null) {
            return List.of();
        }

        return meterReadingMapper.toResponseList(meterReadingRepository.findByRoomIdAndPeriodMonthAndPeriodYear(
                contract.getRoom().getId(), month, year));
    }

    /**
     * Lấy thông tin my meter reading history.
     */
//    @Override
//    @Transactional(readOnly = true)
//    public List<MeterReadingResponse> getMyMeterReadingHistory(Integer userId, int limit) {
//        Contract contract = resolveActiveContract(userId);
//        /**
//         * Thực thi if.
//         * @param null tham số null
//         * @return kết quả kiểu
//         */
//        if (contract == null || contract.getRoom() == null || contract.getRoom().getId() == null) {
//            return List.of();
//        }
//
//        int safeLimit = Math.max(1, Math.min(limit, 60));
//        return meterReadingMapper
//                .toResponseList(meterReadingRepository.findByRoomIdOrderByPeriodYearDescPeriodMonthDescIdDesc(
//                        contract.getRoom().getId()))
//                .stream()
//                .limit(safeLimit)
//                .toList();
//    }

    private Contract resolveActiveContract(Integer userId) {
        return contractRepository
                .findActiveContractByUserId(userId, ContractStatus.ACTIVE, LocalDate.now())
                .orElse(null);
    }
}
