package carevn.luv2code.ez_tro.service.admin.impl;

import carevn.luv2code.ez_tro.dto.requests.MeterReadingRequest;
import carevn.luv2code.ez_tro.dto.response.MeterReadingResponse;
import carevn.luv2code.ez_tro.entity.*;
import carevn.luv2code.ez_tro.enums.PeriodStatus;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.MeterReadingMapper;
import carevn.luv2code.ez_tro.repository.*;
import carevn.luv2code.ez_tro.security.AuthorizationService;
import carevn.luv2code.ez_tro.service.admin.MeterReadingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeterReadingServiceImpl implements MeterReadingService {

    private final MeterReadingPeriodRepository meterReadingPeriodRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final UtilityRepository utilityRepository;
    private final RoomRepository roomRepository;
    private final MeterReadingMapper meterReadingMapper;
    private final AuthorizationService authorizationService;

    @Override
    @Transactional
    public MeterReadingResponse create(MeterReadingRequest request) {
        // Kiểm tra quyền sở hữu (chủ nhà trọ)
        authorizationService.checkOwnerOfRoom(request.getRoomId());

        MeterReadingPeriod period = meterReadingPeriodRepository.findByPeriodMonthAndPeriodYear(
                        request.getPeriodMonth(), request.getPeriodYear())
                .orElseThrow(() -> new AppException(ErrorCode.PERIOD_NOT_FOUND));

        if (period.getStatus() == PeriodStatus.LOCKED) {
            throw new AppException(ErrorCode.PERIOD_LOCKED_CANNOT_EDIT);
        }

        // Kiểm tra trùng kỳ
        if (meterReadingRepository.existsByRoomIdAndUtilityIdAndPeriodMonthAndPeriodYear(
                request.getRoomId(), request.getUtilityId(),
                request.getPeriodMonth(), request.getPeriodYear())) {
            throw new AppException(ErrorCode.METER_READING_ALREADY_EXISTS_FOR_PERIOD);
        }

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        Utility utility = utilityRepository.findById(request.getUtilityId())
                .orElseThrow(() -> new AppException(ErrorCode.UTILITY_NOT_FOUND));

        // Tìm chỉ số kỳ trước
        BigDecimal previous = BigDecimal.ZERO;
        Optional<MeterReading> prevOpt = meterReadingRepository.findLatestPrevious(
                room.getId(), utility.getId(),
                request.getPeriodYear(), request.getPeriodMonth());

        if (prevOpt.isPresent()) {
            previous = prevOpt.get().getCurrentIndex();
        }

        // Giá hiện hành (có thể cải tiến thêm bảng lịch sử giá)
        BigDecimal unitPrice = utility.getUnitPrice();

        BigDecimal consumption = request.getCurrentIndex().subtract(previous);
        if (consumption.compareTo(BigDecimal.ZERO) < 0) {
            throw new AppException(ErrorCode.INVALID_METER_READING_VALUE);
        }

        BigDecimal amount = consumption.multiply(unitPrice);

        MeterReading reading = MeterReading.builder()
                .room(room)
                .utility(utility)
                .periodMonth(request.getPeriodMonth())
                .periodYear(request.getPeriodYear())
                .readingDate(request.getReadingDate() != null ? request.getReadingDate() : new Date())
                .previousIndex(previous)
                .currentIndex(request.getCurrentIndex())
                .consumption(consumption)
                .unitPrice(unitPrice)
                .amount(amount)
                .note(request.getNote())
                .build();

        return meterReadingMapper.toResponse(meterReadingRepository.save(reading));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MeterReadingResponse> getByRoomAndPeriod(Integer roomId, Integer month, Integer year) {
        authorizationService.checkOwnerOfRoom(roomId);
        List<MeterReading> readings = meterReadingRepository
                .findByRoomIdAndPeriodMonthAndPeriodYear(roomId, month, year);
        return meterReadingMapper.toResponseList(readings);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MeterReadingResponse> getHistoryByRoom(Integer roomId) {
        authorizationService.checkOwnerOfRoom(roomId); // hoặc check tenant nếu là phòng đang thuê
        return meterReadingMapper.toResponseList(meterReadingRepository.findByRoomId(roomId));
    }

    @Override
    public List<MeterReadingResponse> batchCreate(List<MeterReadingRequest> requests) {
        return requests.stream()
                .map(this::create)
                .collect(Collectors.toList());
    }
}