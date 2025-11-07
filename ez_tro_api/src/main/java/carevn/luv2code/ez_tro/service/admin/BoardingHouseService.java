package carevn.luv2code.ez_tro.service.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import carevn.luv2code.ez_tro.dto.requests.BoardingHouseRequest;
import carevn.luv2code.ez_tro.dto.response.BoardingHouseResponse;

public interface BoardingHouseService {
    BoardingHouseResponse create(BoardingHouseRequest request);

    BoardingHouseResponse update(Integer id, BoardingHouseRequest request);

    void delete(Integer id);

    BoardingHouseResponse getById(Integer id);

    List<BoardingHouseResponse> getAll();

    List<BoardingHouseResponse> getAllByRole();

    Page<BoardingHouseResponse> getAllPagedByRole(Pageable pageable);

    Page<BoardingHouseResponse> getAllBoardingHousesPaged(int page, int size);
}
