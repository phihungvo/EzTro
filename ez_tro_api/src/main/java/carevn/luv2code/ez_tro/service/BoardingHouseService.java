package carevn.luv2code.ez_tro.service;

import java.util.List;

import carevn.luv2code.ez_tro.dto.requests.BoardingHouseRequest;
import carevn.luv2code.ez_tro.dto.response.BoardingHouseResponse;
import carevn.luv2code.ez_tro.dto.response.BuildingResponse;
import org.springframework.data.domain.Page;

public interface BoardingHouseService {
    BoardingHouseResponse create(BoardingHouseRequest request);

    BoardingHouseResponse update(Integer id, BoardingHouseRequest request);

    void delete(Integer id);

    BoardingHouseResponse getById(Integer id);

    List<BoardingHouseResponse> getAll();

    Page<BoardingHouseResponse> getAllBoardingHousesPaged(int page, int size);
}
