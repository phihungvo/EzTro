package carevn.luv2code.ez_tro.security;

public interface AuthorizationService {

    void checkOwnerOfRoom(Integer roomId);

    void checkOwnerOfBoardingHouse(Integer boardingHouseId);

    boolean isOwnerOfRoom(Integer roomId);

    boolean isUserAnOwner(Integer userId);
}
