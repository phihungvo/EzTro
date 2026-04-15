package carevn.luv2code.ez_tro.service.admin.impl;

import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import carevn.luv2code.ez_tro.dto.requests.OwnerRequest;
import carevn.luv2code.ez_tro.dto.response.OwnerResponse;
import carevn.luv2code.ez_tro.entity.Role;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.OwnerMapper;
import carevn.luv2code.ez_tro.repository.RoleRepository;
import carevn.luv2code.ez_tro.repository.UserRepository;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.OwnerService;
import carevn.luv2code.ez_tro.specification.OwnerSpecs;
import lombok.RequiredArgsConstructor;

/**
 * Service quản lý owner (chủ trọ).
 *
 * <p>Owner được quản lý trong bảng {@link User} với role "OWNER".
 * Service này hỗ trợ CRUD owner và lấy profile owner hiện tại.
 */
@Service
@RequiredArgsConstructor
public class OwnerServiceImpl implements OwnerService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final OwnerMapper ownerMapper;

    /**
     * Lấy danh sách owner phân trang.
     *
     * @param pageable tham số phân trang
     * @return page owner DTO
     */
    @Override
    public Page<OwnerResponse> getAll(Pageable pageable) {
        SecurityUtils.SpecificationSafeUser safe = SecurityUtils.safeUser();
        Specification<User> spec = Specification.where(OwnerSpecs.hasRoleOwner());

        if (!safe.isAdmin()) {
            spec = spec.and(OwnerSpecs.isCurrentUser(safe.get()));
        }
        return userRepository.findAll(spec, pageable).map(ownerMapper::toResponse);
    }

    /**
     * Tạo mới owner.
     *
     * @param request payload tạo owner
     * @return owner DTO sau khi tạo
     */
    @Override
    public OwnerResponse create(OwnerRequest request) {
        validateUnique(request);
        User owner = ownerMapper.toEntity(request);
        owner.setPassword(passwordEncoder.encode(request.getPassword()));
        owner.setRoles(Set.of(getOwnerRole()));
        return ownerMapper.toResponse(userRepository.save(owner));
    }

    /**
     * Cập nhật owner theo id.
     *
     * @param id id owner
     * @param request payload cập nhật
     * @return owner DTO sau cập nhật
     */
    @Override
    public OwnerResponse update(Integer id, OwnerRequest request) {
        User owner = findOwnerById(id);
        if (!owner.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng");
        }
        ownerMapper.updateEntity(owner, request);
        return ownerMapper.toResponse(owner);
    }

    /**
     * Xóa owner theo id.
     *
     * @param id id owner
     */
    @Override
    public void delete(Integer id) {
        User owner = findOwnerById(id);
        //        if (!owner.getBoardingHouses().isEmpty()) {
        //            throw new RuntimeException("Không thể xóa: Chủ trọ đang quản lý nhà trọ");
        //        }
        userRepository.delete(owner);
    }

    /**
     * Lấy owner theo id.
     *
     * @param id id owner
     * @return owner DTO
     */
    @Override
    public OwnerResponse getById(Integer id) {
        return ownerMapper.toResponse(findOwnerById(id));
    }

    /**
     * Lấy profile của owner hiện tại.
     *
     * @return owner DTO
     */
    @Override
    public OwnerResponse getMyProfile() {
        User current = SecurityUtils.getCurrentUser();
        if (!current.getRoles().stream().anyMatch(r -> "OWNER".equals(r.getName()))) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return ownerMapper.toResponse(current);
    }

    private User findOwnerById(Integer id) {
        return userRepository
                .findOne(Specification.where(OwnerSpecs.hasRoleOwner())
                        .and((root, query, cb) -> cb.equal(root.get("id"), id)))
                .orElseThrow(() -> new AppException(ErrorCode.OWNER_NOT_FOUND));
    }

    private Role getOwnerRole() {
        return roleRepository.findByName("OWNER").orElseThrow(() -> new AppException(ErrorCode.OWNER_NOT_FOUND));
    }

    private void validateUnique(OwnerRequest req) {
        if (userRepository.existsByUserName(req.getUserName())) {
            throw new AppException(ErrorCode.USERNAME_EXISTED);
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }
    }
}
