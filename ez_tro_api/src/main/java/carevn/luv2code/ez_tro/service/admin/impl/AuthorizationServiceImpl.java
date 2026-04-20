package carevn.luv2code.ez_tro.service.admin.impl;

import org.springframework.stereotype.Service;

import carevn.luv2code.ez_tro.entity.Room;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.repository.RoomRepository;
import carevn.luv2code.ez_tro.repository.UserRepository;
import carevn.luv2code.ez_tro.security.AuthorizationService;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import lombok.RequiredArgsConstructor;

/**
 * Service hỗ trợ kiểm tra phân quyền theo ownership (owner của khu nhà/phòng).
 *
 * <p>Admin được xem như có toàn quyền và sẽ bypass một số check.
 */
@Service
@RequiredArgsConstructor
public class AuthorizationServiceImpl implements AuthorizationService {

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    /**
     * Kiểm tra user hiện tại có phải owner của phòng hay không (admin bypass).
     *
     * @param roomId id phòng
     */
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

    /**
     * Kiểm tra user hiện tại có phải owner của khu nhà trọ hay không.
     *
     * <p>Hiện tại đang là placeholder (TODO).
     *
     * @param boardingHouseId id khu nhà trọ
     */
    @Override
    public void checkOwnerOfBoardingHouse(Integer boardingHouseId) {
        // Tương tự, kiểm tra owner của BoardingHouse
        // ...
    }

    /**
     * Kiểm tra một userId có role OWNER hay không.
     *
     * @param userId id user
     * @return true nếu là owner
     */
    public boolean isUserAnOwner(Integer userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return false;
        }

        return user.getRoles().stream().anyMatch(role -> "OWNER".equals(role.getName()));
    }

    /**
     * Kiểm tra nhanh user hiện tại có phải owner của phòng hay không.
     *
     * @param roomId id phòng
     * @return true nếu là owner (admin luôn true)
     */
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
