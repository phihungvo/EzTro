package carevn.luv2code.ez_tro.service.admin.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import carevn.luv2code.ez_tro.dto.requests.ElectricWaterRecordRequest;
import carevn.luv2code.ez_tro.dto.response.ElectricWaterRecordResponse;
import carevn.luv2code.ez_tro.entity.ElectricWaterRecord;
import carevn.luv2code.ez_tro.entity.Room;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.ElectricWaterRecordMapper;
import carevn.luv2code.ez_tro.repository.ElectricWaterRecordRepository;
import carevn.luv2code.ez_tro.repository.RoomRepository;
import carevn.luv2code.ez_tro.service.admin.ElectricWaterRecordService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ElectricWaterRecordServiceImpl implements ElectricWaterRecordService {

    private final ElectricWaterRecordRepository recordRepository;
    private final RoomRepository roomRepository;
    private final ElectricWaterRecordMapper mapper;

    @Override
    public ElectricWaterRecordResponse create(ElectricWaterRecordRequest request) {
        Room room = roomRepository
                .findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        ElectricWaterRecord record = mapper.toEntity(request);
        record.setRoom(room);

        recordRepository.save(record);
        return mapper.toResponse(record);
    }

    @Override
    public ElectricWaterRecordResponse update(Integer id, ElectricWaterRecordRequest request) {
        ElectricWaterRecord record = recordRepository
                .findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ELECTRIC_WATER_RECORD_NOT_FOUND));

        record.setMonth(request.getMonth());
        record.setYear(request.getYear());
        record.setElectricStart(request.getElectricStart());
        record.setElectricEnd(request.getElectricEnd());
        record.setWaterStart(request.getWaterStart());
        record.setWaterEnd(request.getWaterEnd());

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
}
