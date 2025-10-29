package carevn.luv2code.ez_tro.service.admin.impl;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.requests.RoomUtilityRequest;
import carevn.luv2code.ez_tro.dto.response.RoomUtilityResponse;
import carevn.luv2code.ez_tro.entity.Room;
import carevn.luv2code.ez_tro.entity.RoomUtility;
import carevn.luv2code.ez_tro.entity.RoomUtilityId;
import carevn.luv2code.ez_tro.entity.Utility;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.RoomUtilityMapper;
import carevn.luv2code.ez_tro.repository.RoomRepository;
import carevn.luv2code.ez_tro.repository.RoomUtilityRepository;
import carevn.luv2code.ez_tro.repository.UtilityRepository;
import carevn.luv2code.ez_tro.service.admin.RoomUtilityService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class RoomUtilityServiceImpl implements RoomUtilityService {

    private final RoomUtilityRepository roomUtilityRepository;
    private final RoomRepository roomRepository;
    private final UtilityRepository utilityRepository;
    private final RoomUtilityMapper roomUtilityMapper;

    @Override
    public RoomUtilityResponse create(RoomUtilityRequest request) {
        Room room = roomRepository
                .findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        Utility utility = utilityRepository
                .findById(request.getUtilityId())
                .orElseThrow(() -> new AppException(ErrorCode.UTILITY_NOT_FOUND));

        RoomUtilityId id = new RoomUtilityId(request.getRoomId(), request.getUtilityId());

        // Check if already exists
        if (roomUtilityRepository.existsById(id)) {
            throw new AppException(ErrorCode.ROOM_UTILITY_ALREADY_EXISTS);
        }

        RoomUtility roomUtility = roomUtilityMapper.toEntity(request);
        roomUtility.setId(id);
        roomUtility.setRoom(room);
        roomUtility.setUtility(utility);

        roomUtility = roomUtilityRepository.save(roomUtility);
        return roomUtilityMapper.toResponse(roomUtility);
    }

    @Override
    public RoomUtilityResponse update(Integer roomId, Integer utilityId, RoomUtilityRequest request) {
        RoomUtilityId id = new RoomUtilityId(roomId, utilityId);
        RoomUtility roomUtility = roomUtilityRepository
                .findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_UTILITY_NOT_FOUND));

        roomUtilityMapper.toEntity(roomUtility, request);

        // Update utility if changed (but since ID fixed, assume same)
        if (utilityId != null && !utilityId.equals(roomUtility.getUtility().getId())) {
            Utility newUtility = utilityRepository
                    .findById(utilityId)
                    .orElseThrow(() -> new AppException(ErrorCode.UTILITY_NOT_FOUND));
            roomUtility.setUtility(newUtility);
            id.setUtilityId(utilityId); // Update ID if utility changed (rare case)
        }

        roomUtility = roomUtilityRepository.save(roomUtility);
        return roomUtilityMapper.toResponse(roomUtility);
    }

    @Override
    public void delete(Integer roomId, Integer utilityId) {
        RoomUtilityId id = new RoomUtilityId(roomId, utilityId);
        RoomUtility roomUtility = roomUtilityRepository
                .findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_UTILITY_NOT_FOUND));
        roomUtilityRepository.delete(roomUtility);
    }

    @Override
    @Transactional(readOnly = true)
    public RoomUtilityResponse getById(Integer roomId, Integer utilityId) {
        RoomUtilityId id = new RoomUtilityId(roomId, utilityId);
        RoomUtility roomUtility = roomUtilityRepository
                .findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_UTILITY_NOT_FOUND));
        return roomUtilityMapper.toResponse(roomUtility);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomUtilityResponse> getByRoomId(Integer roomId) {
        return roomUtilityRepository.findByRoomId(roomId).stream()
                .map(roomUtilityMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomUtilityResponse> getActiveByRoomId(Integer roomId) {
        return roomUtilityRepository.findActiveByRoomId(roomId).stream()
                .map(roomUtilityMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomUtilityResponse> getByUtilityId(Integer utilityId) {
        return roomUtilityRepository.findByUtilityId(utilityId).stream()
                .map(roomUtilityMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RoomUtilityResponse> getByRoomIdPaged(Integer roomId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return roomUtilityRepository.findByRoomIdPaged(roomId, pageable).map(roomUtilityMapper::toResponse);
    }
}
