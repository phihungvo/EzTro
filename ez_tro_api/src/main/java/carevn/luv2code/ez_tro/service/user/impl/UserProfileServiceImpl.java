package carevn.luv2code.ez_tro.service.user.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.requests.UserChangePasswordRequest;
import carevn.luv2code.ez_tro.dto.requests.UserProfileUpdateRequest;
import carevn.luv2code.ez_tro.dto.response.TenantDetailResponse;
import carevn.luv2code.ez_tro.entity.Tenant;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.TenantMapper;
import carevn.luv2code.ez_tro.repository.TenantRepository;
import carevn.luv2code.ez_tro.repository.UserRepository;
import carevn.luv2code.ez_tro.service.user.UserProfileService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class UserProfileServiceImpl implements UserProfileService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final TenantMapper tenantMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public TenantDetailResponse getMyProfile(Integer userId) {
        Tenant tenant =
                tenantRepository.findByUserId(userId).orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_FOUND));
        return tenantMapper.toDetailResponse(tenant);
    }

    @Override
    public TenantDetailResponse updateMyProfile(Integer userId, UserProfileUpdateRequest request) {

        if (request == null) {
            return getMyProfile(userId);
        }

        Tenant tenant =
                tenantRepository.findByUserId(userId).orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_FOUND));
        User user = tenant.getUser();

        if (user == null) {

            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }

        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }

        if (request.getPermanentAddress() != null) {
            tenant.setPermanentAddress(request.getPermanentAddress());
            user.setAddress(request.getPermanentAddress());
        }

        if (request.getIdentityNumber() != null) {
            tenant.setIdentityNumber(request.getIdentityNumber());
        }

        if (request.getIssueDate() != null) {
            tenant.setIssueDate(request.getIssueDate());
        }

        if (request.getIssuePlace() != null) {
            tenant.setIssuePlace(request.getIssuePlace());
        }

        if (request.getDateOfBirth() != null) {
            tenant.setDateOfBirth(request.getDateOfBirth());
        }

        if (request.getGender() != null) {
            tenant.setGender(request.getGender());
        }

        if (request.getOccupation() != null) {
            tenant.setOccupation(request.getOccupation());
        }

        if (request.getVehicleInfo() != null) {
            tenant.setVehicleInfo(request.getVehicleInfo());
        }

        if (request.getEmergencyContact() != null) {
            tenant.setEmergencyContact(request.getEmergencyContact());
        }

        if (request.getEmergencyPhone() != null) {
            tenant.setEmergencyPhone(request.getEmergencyPhone());
        }

        if (request.getNote() != null) {
            tenant.setNote(request.getNote());
        }

        userRepository.save(user);
        Tenant saved = tenantRepository.save(tenant);
        return tenantMapper.toDetailResponse(saved);
    }


    @Override
    public void changeMyPassword(Integer userId, UserChangePasswordRequest request) {

        if (request == null) {
            throw new AppException(ErrorCode.PASSWORD_INVALID);
        }

        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.CURRENT_PASSWORD_INCORRECT);
        }

        if (request.getNewPassword() == null
                || request.getNewPassword().isBlank()
                || request.getNewPassword().length() < 6) {
            throw new AppException(ErrorCode.PASSWORD_INVALID);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setOriginalPassword(request.getNewPassword());
        userRepository.save(user);
    }
}
