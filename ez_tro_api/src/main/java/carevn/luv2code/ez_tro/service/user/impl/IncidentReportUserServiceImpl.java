package carevn.luv2code.ez_tro.service.user.impl;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.requests.IncidentReportRequest;
import carevn.luv2code.ez_tro.dto.response.IncidentReportResponse;
import carevn.luv2code.ez_tro.entity.*;
import carevn.luv2code.ez_tro.enums.IncidentStatus;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.IncidentReportMapper;
import carevn.luv2code.ez_tro.repository.ContractRepository;
import carevn.luv2code.ez_tro.repository.IncidentReportRepository;
import carevn.luv2code.ez_tro.repository.RoomRepository;
import carevn.luv2code.ez_tro.repository.TenantRepository;
import carevn.luv2code.ez_tro.service.user.IncidentReportUserService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IncidentReportUserServiceImpl implements IncidentReportUserService {

    private final IncidentReportRepository incidentReportRepository;
    private final TenantRepository tenantRepository;
    private final RoomRepository roomRepository;
    private final IncidentReportMapper incidentReportMapper;
    private final ContractRepository contractRepository;

    @Override
    @Transactional
    public IncidentReportResponse create(Integer userId, IncidentReportRequest request) {
        //        Tenant tenant = tenantRepository
        //                .findById(request.getTenantId())
        //                .orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_FOUND));
        //
        //        Room room = roomRepository
        //                .findById(request.getRoomId())
        //                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        //        Building building = buildingMapper.toEntity(request);

        Tenant tenant = tenantRepository
                .findByUserId(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tenant cho user ID: " + userId));

        Contract activeContract = contractRepository
                .findActiveContractByTenantId(tenant.getId())
                .orElseThrow(() -> new AppException(ErrorCode.YOU_DO_NOT_HAVE_ACTIVE_CONTRACT));

        IncidentReport report = IncidentReport.builder()
                .tenant(tenant)
                .room(activeContract.getRoom())
                .title(request.getTitle())
                .description(request.getDescription())
                .status(IncidentStatus.PENDING)
                .build();

        incidentReportRepository.save(report);

        return incidentReportMapper.toResponse(report);
    }

    @Override
    public List<IncidentReportResponse> getAllByUserId(Integer userId) {

        Tenant tenant = tenantRepository
                .findByUserId(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tenant cho user ID: " + userId));
        List<IncidentReport> response = incidentReportRepository.findAllByTenant(tenant);

        return response.stream().map(incidentReportMapper::toResponse).collect(Collectors.toList());
    }
}
