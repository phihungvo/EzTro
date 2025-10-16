package carevn.luv2code.ez_tro.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.BoardingHouseRequest;
import carevn.luv2code.ez_tro.dto.response.ApiResponse;
import carevn.luv2code.ez_tro.dto.response.BoardingHouseResponse;
import carevn.luv2code.ez_tro.service.BoardingHouseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/boarding-houses")
@RequiredArgsConstructor
public class BoardingHouseController {

    private final BoardingHouseService service;

    @PostMapping
    public ApiResponse<BoardingHouseResponse> create(@Valid @RequestBody BoardingHouseRequest request) {
        BoardingHouseResponse response = service.create(request);
        return ApiResponse.<BoardingHouseResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Boarding house created successfully")
                .result(response)
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<BoardingHouseResponse> update(
            @PathVariable Integer id, @Valid @RequestBody BoardingHouseRequest request) {
        BoardingHouseResponse response = service.update(id, request);
        return ApiResponse.<BoardingHouseResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Boarding house updated successfully")
                .result(response)
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.NO_CONTENT.value())
                .message("Boarding house deleted successfully")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<BoardingHouseResponse> get(@PathVariable Integer id) {
        BoardingHouseResponse response = service.getById(id);
        return ApiResponse.<BoardingHouseResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get boarding house successfully")
                .result(response)
                .build();
    }

    @GetMapping
    public ApiResponse<List<BoardingHouseResponse>> getAll() {
        List<BoardingHouseResponse> responses = service.getAll();
        return ApiResponse.<List<BoardingHouseResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Get all boarding houses successfully")
                .result(responses)
                .build();
    }
}
