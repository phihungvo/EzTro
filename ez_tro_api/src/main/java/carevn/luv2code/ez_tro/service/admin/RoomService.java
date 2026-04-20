package carevn.luv2code.ez_tro.service.admin;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import carevn.luv2code.ez_tro.dto.requests.RoomRequest;
import carevn.luv2code.ez_tro.dto.response.*;
import carevn.luv2code.ez_tro.enums.RoomStatus;

/**
 * Service contract quản lý phòng (Room) và các context liên quan phục vụ billing.
 */
public interface RoomService {
    RoomResponse create(RoomRequest request);

    RoomResponse update(Integer id, RoomRequest request);

    void delete(Integer id);

    RoomResponse getById(Integer id);

    List<RoomResponse> getAll();

    List<RoomResponse> getAvailableByStatus(Integer boardingHouseId, RoomStatus status);

    List<RoomResponse> getAvailableRooms();

    Page<RoomResponse> getAllRoomsPaged(int page, int size);

    Page<RoomResponse> getAllRoomsByRole(Pageable pageable);

    Page<RoomResponse> filterRooms(
            String search,
            String status,
            Integer boardingHouseId,
            Integer minArea,
            Integer maxArea,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Boolean hasActiveContract,
            Pageable pageable);

    Page<RentedRoomContextResponse> getRentedActiveRooms(
            Integer boardingHouseId, Integer floor, int month, int year, Pageable pageable);

    RentedRoomDetailResponse getRentedRoomDetail(Integer roomId, int month, int year);

    CreatorBillContextResponse getCreatorBillContext(Integer roomId, int month, int year);

    List<RoomPeriodSummaryResponse> getRoomsSummaryByBoardingHouseAndPeriod(
            Integer boardingHouseId,
            Integer month, // 1-12
            Integer year);

    List<RoomResponse> getAllByRole();

    List<RoomResponse> getByBoardingHouseId(Integer boardingHouseId);

    List<RoomResponse> getByBuildingId(Integer buildingId);
}
