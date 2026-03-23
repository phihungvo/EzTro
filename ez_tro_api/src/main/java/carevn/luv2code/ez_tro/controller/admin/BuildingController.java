package carevn.luv2code.ez_tro.controller.admin;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import carevn.luv2code.ez_tro.dto.requests.BuildingRequest;
import carevn.luv2code.ez_tro.dto.response.BuildingResponse;
import carevn.luv2code.ez_tro.service.admin.BuildingService;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/buildings")
@RequiredArgsConstructor
public class BuildingController {

    private final BuildingService buildingService;

    @GetMapping("/paged-by-role")
    public ResponseEntity<Page<BuildingResponse>> getAllBuildingsByRole(
            @Parameter(description = "Phân trang") Pageable pageable) {
        return ResponseEntity.ok(buildingService.getAllBuildingsByRole(pageable));
    }

    @PostMapping
    public ResponseEntity<BuildingResponse> create(@Valid @RequestBody BuildingRequest request) {
        return ResponseEntity.ok(buildingService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BuildingResponse> update(
            @PathVariable Integer id, @Valid @RequestBody BuildingRequest request) {
        return ResponseEntity.ok(buildingService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        buildingService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<BuildingResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(buildingService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<BuildingResponse>> getAll() {
        return ResponseEntity.ok(buildingService.getAll());
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<BuildingResponse>> getAllBuildings(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Page<BuildingResponse> buildings = buildingService.getAllBuildingsPaged(page, size);
        return ResponseEntity.ok(buildings);
    }

    @GetMapping("/boarding-house/{boardingHouseId}")
    public ResponseEntity<List<BuildingResponse>> getByBoardingHouse(@PathVariable Integer boardingHouseId) {
        return ResponseEntity.ok(buildingService.getByBoardingHouse(boardingHouseId));
    }
}
