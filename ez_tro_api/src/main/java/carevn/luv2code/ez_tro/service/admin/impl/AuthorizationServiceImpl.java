package carevn.luv2code.ez_tro.service.admin.impl;

import org.springframework.stereotype.Service;

import carevn.luv2code.ez_tro.entity.Room;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.repository.RoomRepository;
import carevn.luv2code.ez_tro.security.AuthorizationService;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthorizationServiceImpl implements AuthorizationService {

    private final RoomRepository roomRepository;

    @Override
    public void checkOwnerOfRoom(Integer roomId) {
        if (SecurityUtils.isAdmin()) {
            return; // Admin full quyền
        }

        User currentUser = SecurityUtils.getCurrentUserOrThrow();

        Room room = roomRepository.findById(roomId).orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        if (!currentUser.getId().equals(room.getBoardingHouse().getOwner().getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    @Override
    public void checkOwnerOfBoardingHouse(Integer boardingHouseId) {
        // Tương tự, kiểm tra owner của BoardingHouse
        // ...
    }

    @Override
    public boolean isOwnerOfRoom(Integer roomId) {
        try {
            checkOwnerOfRoom(roomId);
            return true;
        } catch (AppException e) {
            return false;
        }
    }
}
