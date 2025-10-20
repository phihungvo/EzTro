package carevn.luv2code.ez_tro.service.impl;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import carevn.luv2code.ez_tro.dto.requests.BoardingHouseRequest;
import carevn.luv2code.ez_tro.dto.response.BoardingHouseResponse;
import carevn.luv2code.ez_tro.entity.BoardingHouse;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.BoardingHouseMapper;
import carevn.luv2code.ez_tro.repository.BoardingHouseRepository;
import carevn.luv2code.ez_tro.repository.UserRepository;
import carevn.luv2code.ez_tro.service.BoardingHouseService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BoardingHouseServiceImpl implements BoardingHouseService {
    private final BoardingHouseRepository boardingHouseRepository;
    private final UserRepository userRepository;
    private final BoardingHouseMapper boardingHouseMapper;

    @Override
    public BoardingHouseResponse create(BoardingHouseRequest request) {
        User owner = userRepository
                .findById(request.getOwnerId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        BoardingHouse house = boardingHouseMapper.toEntity(request);
        house.setOwner(owner);

        boardingHouseRepository.save(house);
        return boardingHouseMapper.toResponse(house);
    }

    @Override
    public BoardingHouseResponse update(Integer id, BoardingHouseRequest request) {
        BoardingHouse house = boardingHouseRepository
                .findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOARDING_HOUSE_NOT_FOUND));

        house.setName(request.getName());
        house.setAddress(request.getAddress());
        house.setDescription(request.getDescription());
        house.setTotalRooms(request.getTotalRooms());

        boardingHouseRepository.save(house);
        return boardingHouseMapper.toResponse(house);
    }

    @Override
    public void delete(Integer id) {
        BoardingHouse house = boardingHouseRepository
                .findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOARDING_HOUSE_NOT_FOUND));
        boardingHouseRepository.delete(house);
    }

    @Override
    public BoardingHouseResponse getById(Integer id) {
        BoardingHouse house = boardingHouseRepository
                .findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOARDING_HOUSE_NOT_FOUND));
        return boardingHouseMapper.toResponse(house);
    }

    @Override
    public List<BoardingHouseResponse> getAll() {
        return boardingHouseRepository.findAll().stream()
                .map(boardingHouseMapper::toResponse)
                .toList();
    }

    @Override
    public Page<BoardingHouseResponse> getAllBoardingHousesPaged(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        return boardingHouseRepository.findAll(pageRequest).map(boardingHouseMapper::toResponse);
    }
}
