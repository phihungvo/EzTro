package carevn.luv2code.ez_tro.service.admin.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.response.RoomAmenityResponse;
import carevn.luv2code.ez_tro.mapper.RoomAmenityMapper;
import carevn.luv2code.ez_tro.repository.RoomAmenityRepository;
import carevn.luv2code.ez_tro.service.admin.RoomAmenityService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomAmenityServiceImpl implements RoomAmenityService {

    private final RoomAmenityRepository roomAmenityRepository;
    private final RoomAmenityMapper roomAmenityMapper;

    @Override
    public List<RoomAmenityResponse> getByBoardingHouseId(Integer boardingHouseId) {
        return roomAmenityMapper.toResponseList(roomAmenityRepository.findAllByRoom_BoardingHouse_Id(boardingHouseId));
    }
}
