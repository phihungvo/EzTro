package carevn.luv2code.ez_tro.service.admin.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.requests.BillRequest;
import carevn.luv2code.ez_tro.dto.requests.ElectricWaterRecordRequest;
import carevn.luv2code.ez_tro.dto.response.ElectricWaterRecordResponse;
import carevn.luv2code.ez_tro.entity.*;
import carevn.luv2code.ez_tro.enums.ContractStatus;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.ElectricWaterRecordMapper;
import carevn.luv2code.ez_tro.repository.ContractRepository;
import carevn.luv2code.ez_tro.repository.ElectricWaterRecordRepository;
import carevn.luv2code.ez_tro.repository.RoomRepository;
import carevn.luv2code.ez_tro.repository.UtilityRepository;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.BillService;
import carevn.luv2code.ez_tro.service.admin.ElectricWaterRecordService;
import carevn.luv2code.ez_tro.specification.ElectricWaterRecordSpecs;
import carevn.luv2code.ez_tro.util.DateUtils;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ElectricWaterRecordServiceImpl implements ElectricWaterRecordService {

    private final ElectricWaterRecordRepository recordRepository;
    private final RoomRepository roomRepository;
    private final UtilityRepository utilityRepository;
    private final ElectricWaterRecordMapper mapper;
    private final BillService billService;
    private final SecurityUtils securityUtils;
    private final ContractRepository contractRepository;

    @Override
    public ElectricWaterRecordResponse create(ElectricWaterRecordRequest request) {
        Room room = roomRepository
                .findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        if (recordRepository.existsByRoomIdAndMonthAndYear(
                request.getRoomId(), request.getMonth(), request.getYear())) {
            throw new AppException(ErrorCode.ELECTRIC_WATER_RECORD_EXISTS);
        }

        ElectricWaterRecord record = mapper.toEntity(request);
        record.setRoom(room);
        record.setRecordedBy(
                Objects.requireNonNull(SecurityUtils.getCurrentUser()).getFullName());

        calculateCosts(record, room.getBoardingHouse().getId());

        recordRepository.save(record);

        createBillFromRecord(record);

        return mapper.toResponse(record);
    }

    @Override
    @Transactional
    public ElectricWaterRecordResponse update(Integer id, ElectricWaterRecordRequest request) {
        ElectricWaterRecord record = recordRepository
                .findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ELECTRIC_WATER_RECORD_NOT_FOUND));

        mapper.updateEntity(record, request);
        calculateCosts(record, record.getRoom().getBoardingHouse().getId());

        recordRepository.save(record);

        return mapper.toResponse(record);
    }

    @Override
    public void delete(Integer id) {
        ElectricWaterRecord record = recordRepository
                .findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ELECTRIC_WATER_RECORD_NOT_FOUND));
        recordRepository.delete(record);
    }

    @Override
    public ElectricWaterRecordResponse getById(Integer id) {
        ElectricWaterRecord record = recordRepository
                .findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ELECTRIC_WATER_RECORD_NOT_FOUND));
        return mapper.toResponse(record);
    }

    @Override
    public List<ElectricWaterRecordResponse> getAll() {
        return recordRepository.findAll().stream().map(mapper::toResponse).toList();
    }

    @Override
    public Page<ElectricWaterRecordResponse> getAll(Pageable pageable) {
        User currentUser = SecurityUtils.getCurrentUser();
        Specification<ElectricWaterRecord> spec = Specification.where(null);
        if (!SecurityUtils.isAdmin()) {
            spec = spec.and(ElectricWaterRecordSpecs.ownedByOwner(currentUser));
        }
        return recordRepository.findAll(spec, pageable).map(mapper::toResponse);
    }

    @Override
    public Page<ElectricWaterRecordResponse> filter(Integer roomId, Integer month, Integer year, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Specification<ElectricWaterRecord> spec = Specification.where(null);

        User user = SecurityUtils.getCurrentUser();
        if (!SecurityUtils.isAdmin()) {
            spec = spec.and(ElectricWaterRecordSpecs.ownedByOwner(user));
        }
        if (roomId != null) {
            spec = spec.and(ElectricWaterRecordSpecs.hasRoom(roomId));
        }
        if (month != null || year != null) {
            spec = spec.and(ElectricWaterRecordSpecs.inMonthYear(month, year));
        }
        return recordRepository.findAll(spec, pageable).map(mapper::toResponse);
    }

    @Override
    public List<ElectricWaterRecordResponse> getByRoom(Integer roomId) {
        return recordRepository.findByRoomId(roomId, Pageable.unpaged()).stream()
                .map(mapper::toResponse)
                .toList();
    }

    private void calculateCosts(ElectricWaterRecord record, Integer boardingHouseId) {
        record.setElectricUsage(calculateUsage(record.getElectricEnd(), record.getElectricStart()));
        record.setWaterUsage(calculateUsage(record.getWaterEnd(), record.getWaterStart()));

        BigDecimal electricPrice = getUtilityPrice("ĐIỆN", boardingHouseId);
        BigDecimal waterPrice = getUtilityPrice("NƯỚC", boardingHouseId);

        record.setElectricCost(record.getElectricUsage().multiply(electricPrice));
        record.setWaterCost(record.getWaterUsage().multiply(waterPrice));
        record.setTotalCost(record.getElectricCost().add(record.getWaterCost()));
    }

    private BigDecimal calculateUsage(Integer end, Integer start) {
        if (end != null && start != null && end >= start) {
            return BigDecimal.valueOf(end - start);
        }
        return BigDecimal.ZERO;
    }

    private BigDecimal getUtilityPrice(String name, Integer boardingHouseId) {
        return utilityRepository
                .findByNameAndBoardingHouseId(name, boardingHouseId)
                .map(Utility::getUnitPrice)
                .orElse(BigDecimal.ZERO);
    }

    private void createBillFromRecord(ElectricWaterRecord record) {
        contractRepository
                .findByRoomIdAndStatus(record.getRoom().getId(), ContractStatus.ACTIVE)
                .ifPresent(contract -> {
                    BillRequest billRequest = new BillRequest();
                    billRequest.setContractId(contract.getId());
                    billRequest.setServiceAmount(record.getTotalCost());
                    billRequest.setBillTitle("Hóa đơn điện nước tháng " + record.getMonth() + "/" + record.getYear());
                    billRequest.setDueDate(DateUtils.calculateDueDateFromContract(contract.getMonthlyPaymentDay()));

                    billService.create(billRequest);
                });
    }
}
