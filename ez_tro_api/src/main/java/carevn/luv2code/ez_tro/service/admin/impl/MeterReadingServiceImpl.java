package carevn.luv2code.ez_tro.service.admin.impl;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

/**
 * Service xử lý nghiệp vụ ghi chỉ số (meter readings) cho phòng theo kỳ.
 *
 * <p>Luồng chính:
 * <ul>
 *   <li>Tạo mới hoặc upsert chỉ số theo (roomId, utilityId, periodMonth, periodYear).</li>
 *   <li>Tự resolve period (tạo DRAFT nếu chưa có), chặn sửa khi period LOCKED.</li>
 *   <li>Tự tính previousIndex từ kỳ gần nhất nếu không có dữ liệu trước đó.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class MeterReadingServiceImpl implements MeterReadingService {

    private final MeterReadingPeriodRepository meterReadingPeriodRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final UtilityRepository utilityRepository;
    private final RoomRepository roomRepository;
    private final MeterReadingMapper meterReadingMapper;
    private final AuthorizationService authorizationService;

    /**
     * Tạo mới meter reading cho một phòng/utility/kỳ.
     *
     * @param request payload ghi chỉ số
     * @return meter reading DTO sau khi tạo
     */
    @Override
    @Transactional
    public MeterReadingResponse create(MeterReadingRequest request) {
        // Kiểm tra quyền sở hữu (chủ nhà trọ)
        //        authorizationService.checkOwnerOfRoom(request.getRoomId());
        //
        //        MeterReadingPeriod period = meterReadingPeriodRepository
        //                .findByPeriodMonthAndPeriodYear(request.getPeriodMonth(), request.getPeriodYear())
        //                .orElseThrow(() -> new AppException(ErrorCode.PERIOD_NOT_FOUND));
        //
        //        if (period.getStatus() == PeriodStatus.LOCKED) {
        //            throw new AppException(ErrorCode.PERIOD_LOCKED_CANNOT_EDIT);
        //        }

        // Kiểm tra trùng kỳ
        if (meterReadingRepository.existsByRoomIdAndUtilityIdAndPeriodMonthAndPeriodYear(
                request.getRoomId(), request.getUtilityId(),
                request.getPeriodMonth(), request.getPeriodYear())) {
            throw new AppException(ErrorCode.METER_READING_ALREADY_EXISTS_FOR_PERIOD);
        }

        MeterReading reading = buildReadingEntity(request, null);
        return meterReadingMapper.toResponse(meterReadingRepository.save(reading));
    }

    /**
     * Upsert meter reading: update nếu đã tồn tại, create nếu chưa.
     *
     * @param request payload ghi chỉ số
     * @return meter reading DTO sau khi lưu
     */
    @Override
    @Transactional
    public MeterReadingResponse upsert(MeterReadingRequest request) {
        Optional<MeterReading> existing = meterReadingRepository.findByRoomIdAndUtilityIdAndPeriodMonthAndPeriodYear(
                request.getRoomId(), request.getUtilityId(), request.getPeriodMonth(), request.getPeriodYear());

        MeterReading reading = buildReadingEntity(request, existing.orElse(null));
        return meterReadingMapper.toResponse(meterReadingRepository.save(reading));
    }

    /**
     * Lấy danh sách meter readings theo phòng và kỳ (tháng/năm).
     *
     * @param roomId id phòng
     * @param month tháng
     * @param year năm
     * @return danh sách meter reading DTO
     */
    @Override
    @Transactional(readOnly = true)
    public List<MeterReadingResponse> getByRoomAndPeriod(Integer roomId, Integer month, Integer year) {
        authorizationService.checkOwnerOfRoom(roomId);
        List<MeterReading> readings =
                meterReadingRepository.findByRoomIdAndPeriodMonthAndPeriodYear(roomId, month, year);
        return meterReadingMapper.toResponseList(readings);
    }

    /**
     * Lấy lịch sử meter readings theo phòng.
     *
     * @param roomId id phòng
     * @return danh sách meter reading DTO
     */
    @Override
    @Transactional(readOnly = true)
    public List<MeterReadingResponse> getHistoryByRoom(Integer roomId) {
        authorizationService.checkOwnerOfRoom(roomId); // hoặc check tenant nếu là phòng đang thuê
        return meterReadingMapper.toResponseList(meterReadingRepository.findByRoomId(roomId));
    }

    /**
     * Tạo hàng loạt meter readings (gọi lần lượt {@link #create(MeterReadingRequest)}).
     *
     * @param requests danh sách request
     * @return danh sách meter reading DTO
     */
    @Override
    public List<MeterReadingResponse> batchCreate(List<MeterReadingRequest> requests) {
        return requests.stream().map(this::create).collect(Collectors.toList());
    }

    private MeterReading buildReadingEntity(MeterReadingRequest request, MeterReading existing) {
        authorizationService.checkOwnerOfRoom(request.getRoomId());

        //        MeterReadingPeriod period = meterReadingPeriodRepository
        //                .findByPeriodMonthAndPeriodYear(request.getPeriodMonth(), request.getPeriodYear())
        //                .orElseThrow(() -> new AppException(ErrorCode.PERIOD_NOT_FOUND));

        MeterReadingPeriod period = meterReadingPeriodRepository
                .findByPeriodMonthAndPeriodYear(request.getPeriodMonth(), request.getPeriodYear())
                .orElseGet(() -> {
                    MeterReadingPeriod p = new MeterReadingPeriod();
                    p.setPeriodMonth(request.getPeriodMonth());
                    p.setPeriodYear(request.getPeriodYear());
                    p.setStatus(PeriodStatus.DRAFT);
                    return meterReadingPeriodRepository.save(p);
                });

        if (period.getStatus() == PeriodStatus.LOCKED) {
            throw new AppException(ErrorCode.PERIOD_LOCKED_CANNOT_EDIT);
        }

        Room room = roomRepository
                .findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        Utility utility = utilityRepository
                .findById(request.getUtilityId())
                .orElseThrow(() -> new AppException(ErrorCode.UTILITY_NOT_FOUND));

        BigDecimal previous =
                existing != null && existing.getPreviousIndex() != null ? existing.getPreviousIndex() : BigDecimal.ZERO;

        if (existing == null || existing.getPreviousIndex() == null) {
            Optional<MeterReading> prevOpt = meterReadingRepository.findLatestPrevious(
                    room.getId(), utility.getId(), request.getPeriodYear(), request.getPeriodMonth());

            if (prevOpt.isPresent() && prevOpt.get().getCurrentIndex() != null) {
                previous = prevOpt.get().getCurrentIndex();
            }
        }

        BigDecimal unitPrice = request.getUnitPrice() != null ? request.getUnitPrice() : utility.getUnitPrice();
        BigDecimal consumption = request.getCurrentIndex().subtract(previous);
        if (consumption.compareTo(BigDecimal.ZERO) < 0) {
            throw new AppException(ErrorCode.INVALID_METER_READING_VALUE);
        }

        BigDecimal amount = consumption.multiply(unitPrice);
        MeterReading reading = existing != null ? existing : new MeterReading();
        reading.setRoom(room);
        reading.setUtility(utility);
        reading.setPeriod(period);
        reading.setPeriodMonth(request.getPeriodMonth());
        reading.setPeriodYear(request.getPeriodYear());
        reading.setReadingDate(request.getReadingDate() != null ? request.getReadingDate() : new Date());
        reading.setPreviousIndex(previous);
        reading.setCurrentIndex(request.getCurrentIndex());
        reading.setConsumption(consumption);
        reading.setUnitPrice(unitPrice);
        reading.setAmount(amount);
        reading.setNote(request.getNote());
        return reading;
    }
}
