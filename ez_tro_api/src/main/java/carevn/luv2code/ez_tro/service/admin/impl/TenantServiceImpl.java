package carevn.luv2code.ez_tro.service.admin.impl;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import carevn.luv2code.ez_tro.dto.requests.TenantRequest;
import carevn.luv2code.ez_tro.dto.response.TenantResponse;
import carevn.luv2code.ez_tro.entity.Tenant;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.TenantMapper;
import carevn.luv2code.ez_tro.repository.TenantRepository;
import carevn.luv2code.ez_tro.repository.UserRepository;
import carevn.luv2code.ez_tro.service.admin.TenantService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TenantServiceImpl implements TenantService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final TenantMapper tenantMapper;

    @Override
    public TenantResponse create(TenantRequest request) {
        User user = userRepository
                .findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Tenant tenant = tenantMapper.toEntity(request);
        tenant.setUser(user);

        tenantRepository.save(tenant);
        return tenantMapper.toResponse(tenant);
    }

    @Override
    public TenantResponse update(Integer id, TenantRequest request) {
        Tenant tenant = tenantRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_FOUND));

        tenant.setIdentityNumber(request.getIdentityNumber());
        tenant.setDateOfBirth(request.getDateOfBirth());
        tenant.setGender(request.getGender());
        tenant.setOccupation(request.getOccupation());
        tenant.setNote(request.getNote());

        tenantRepository.save(tenant);
        return tenantMapper.toResponse(tenant);
    }

    @Override
    public void delete(Integer id) {
        Tenant tenant = tenantRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_FOUND));
        tenantRepository.delete(tenant);
    }

    @Override
    public TenantResponse getById(Integer id) {
        Tenant tenant = tenantRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_FOUND));
        return tenantMapper.toResponse(tenant);
    }

    @Override
    public List<TenantResponse> getAll() {
        return tenantRepository.findAll().stream().map(tenantMapper::toResponse).toList();
    }

    @Override
    public Page<TenantResponse> getAllTenantsPaged(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        return tenantRepository.findAll(pageRequest).map(tenantMapper::toResponse);
    }
}
