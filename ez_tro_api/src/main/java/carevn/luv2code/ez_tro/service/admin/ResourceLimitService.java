package carevn.luv2code.ez_tro.service.admin;

public interface ResourceLimitService {

    void validateCanCreateBoardingHouse(Integer ownerId);

    void validateCanCreateBuilding(Integer ownerId);

    void validateCanCreateRoom(Integer ownerId);

}
