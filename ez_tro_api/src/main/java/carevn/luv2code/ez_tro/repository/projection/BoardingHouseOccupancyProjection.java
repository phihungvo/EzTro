package carevn.luv2code.ez_tro.repository.projection;

/**
 * Projection số liệu phòng theo từng khu nhà cho dashboard owner.
 */
public interface BoardingHouseOccupancyProjection {

    Integer getBoardingHouseId();

    String getBoardingHouseName();

    long getTotalRooms();

    long getOccupiedRooms();
}
