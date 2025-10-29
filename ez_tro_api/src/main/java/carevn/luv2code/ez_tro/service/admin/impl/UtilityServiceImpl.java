package carevn.luv2code.ez_tro.service.admin.impl;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.requests.UtilityRequest;
import carevn.luv2code.ez_tro.dto.response.UtilityResponse;
import carevn.luv2code.ez_tro.entity.BoardingHouse;
import carevn.luv2code.ez_tro.entity.Utility;
import carevn.luv2code.ez_tro.enums.ServiceType;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.UtilityMapper;
import carevn.luv2code.ez_tro.repository.BoardingHouseRepository;
import carevn.luv2code.ez_tro.repository.UtilityRepository;
import carevn.luv2code.ez_tro.service.admin.UtilityService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class UtilityServiceImpl implements UtilityService {

    private final UtilityRepository utilityRepository;
    private final BoardingHouseRepository boardingHouseRepository;
    private final UtilityMapper utilityMapper;

    @Override
    public UtilityResponse create(UtilityRequest request) {
        Utility utility = utilityMapper.toEntity(request);

        // Set boardingHouse if provided
        if (request.getBoardingHouseId() != null) {
            BoardingHouse house = boardingHouseRepository
                    .findById(request.getBoardingHouseId())
                    .orElseThrow(() -> new AppException(ErrorCode.BOARDING_HOUSE_NOT_FOUND));
            utility.setBoardingHouse(house);
        }

        // Set type from string to enum
        utility.setType(ServiceType.valueOf(request.getType()));

        utility = utilityRepository.save(utility);
        return utilityMapper.toResponse(utility);
    }

    @Override
    public UtilityResponse update(Integer id, UtilityRequest request) {
        Utility utility =
                utilityRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.UTILITY_NOT_FOUND));

        utilityMapper.toEntity(utility, request);

        // Update boardingHouse if changed
        if (request.getBoardingHouseId() != null) {
            BoardingHouse house = boardingHouseRepository
                    .findById(request.getBoardingHouseId())
                    .orElseThrow(() -> new AppException(ErrorCode.BOARDING_HOUSE_NOT_FOUND));
            utility.setBoardingHouse(house);
        }

        // Update type
        utility.setType(ServiceType.valueOf(request.getType()));

        utility = utilityRepository.save(utility);
        return utilityMapper.toResponse(utility);
    }

    @Override
    public void delete(Integer id) {
        Utility utility =
                utilityRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.UTILITY_NOT_FOUND));
        utilityRepository.delete(utility);
    }

    @Override
    @Transactional(readOnly = true)
    public UtilityResponse getById(Integer id) {
        Utility utility =
                utilityRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.UTILITY_NOT_FOUND));
        return utilityMapper.toResponse(utility);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UtilityResponse> getAll() {
        return utilityRepository.findAll().stream()
                .map(utilityMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UtilityResponse> getAllPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return utilityRepository.findAll(pageable).map(utilityMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UtilityResponse> getByBoardingHouse(Integer boardingHouseId) {
        return utilityRepository.findByBoardingHouseId(boardingHouseId).stream()
                .map(utilityMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UtilityResponse> getActiveByBoardingHouse(Integer boardingHouseId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return utilityRepository
                .findActiveByBoardingHouseId(boardingHouseId, pageable)
                .map(utilityMapper::toResponse);
    }
}
