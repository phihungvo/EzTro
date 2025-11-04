package carevn.luv2code.ez_tro.service.admin.impl;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.requests.IncidentReportRequest;
import carevn.luv2code.ez_tro.dto.response.IncidentReportResponse;
import carevn.luv2code.ez_tro.entity.*;
import carevn.luv2code.ez_tro.enums.IncidentStatus;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.IncidentReportMapper;
import carevn.luv2code.ez_tro.repository.*;
import carevn.luv2code.ez_tro.service.admin.IncidentReportService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IncidentReportServiceImpl implements IncidentReportService {

    private final IncidentReportRepository incidentReportRepository;
    private final TenantRepository tenantRepository;
    private final RoomRepository roomRepository;
    private final IncidentReportMapper incidentReportMapper;

    @Override
    @Transactional
    public IncidentReportResponse create(IncidentReportRequest request) {
        Tenant tenant = tenantRepository
                .findById(request.getTenantId())
                .orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_FOUND));

        Room room = roomRepository
                .findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        IncidentReport report = IncidentReport.builder()
                .tenant(tenant)
                .room(room)
                .title(request.getTitle())
                .description(request.getDescription())
                .status(IncidentStatus.PENDING)
                .build();

        incidentReportRepository.save(report);

        return incidentReportMapper.toResponse(report);
    }

    @Override
    public Page<IncidentReportResponse> getAllPaged(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        return incidentReportRepository.findAll(pageRequest).map(incidentReportMapper::toResponse);
    }

    @Override
    public List<IncidentReportResponse> getByRoom(Integer roomId) {
        return incidentReportRepository.findAllByRoomId(roomId).stream()
                .map(incidentReportMapper::toResponse)
                .toList();
    }

    @Override
    public List<IncidentReportResponse> getByTenant(Integer tenantId) {
        return incidentReportRepository.findAllByTenantId(tenantId).stream()
                .map(incidentReportMapper::toResponse)
                .toList();
    }
}
