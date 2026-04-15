package carevn.luv2code.ez_tro.service.admin.impl;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.dto.requests.IncidentReportRequest;
import carevn.luv2code.ez_tro.dto.response.IncidentReportResponse;
import carevn.luv2code.ez_tro.entity.*;
import carevn.luv2code.ez_tro.enums.ContractStatus;
import carevn.luv2code.ez_tro.enums.IncidentStatus;
import carevn.luv2code.ez_tro.exception.AppException;
import carevn.luv2code.ez_tro.exception.ErrorCode;
import carevn.luv2code.ez_tro.mapper.IncidentReportMapper;
import carevn.luv2code.ez_tro.repository.*;
import carevn.luv2code.ez_tro.security.SecurityUtils;
import carevn.luv2code.ez_tro.service.admin.IncidentNotificationService;
import carevn.luv2code.ez_tro.service.admin.IncidentReportService;
import lombok.RequiredArgsConstructor;

/**
 * Service xử lý nghiệp vụ báo cáo sự cố (Incident Report) phía admin/owner.
 *
 * <p>Tạo report gắn theo phòng và tự resolve tenant hiện tại (nếu phòng đang có hợp đồng ACTIVE).
 */
@Service
@RequiredArgsConstructor
public class IncidentReportServiceImpl implements IncidentReportService {

    private final IncidentReportRepository incidentReportRepository;
    private final TenantRepository tenantRepository;
    private final RoomRepository roomRepository;
    private final IncidentReportMapper incidentReportMapper;
    private final ContractRepository contractRepository;
    private final IncidentNotificationService incidentNotificationService;

    /**
     * Tạo mới báo cáo sự cố.
     *
     * @param request payload báo cáo (roomId, title, description...)
     * @return report DTO sau khi tạo
     */
    @Override
    @Transactional
    public IncidentReportResponse create(IncidentReportRequest request) {
        Room room = roomRepository
                .findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        validateRoomAccess(room);

        Tenant tenant = contractRepository
                .findByRoomIdAndStatus(room.getId(), ContractStatus.ACTIVE)
                .map(Contract::getTenant)
                .orElse(null);

        IncidentReport report = IncidentReport.builder()
                .room(room)
                .tenant(tenant)
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : IncidentStatus.PENDING)
                .expectedResolveDate(request.getExpectedResolveDate())
                .build();

        incidentReportRepository.save(report);
        incidentNotificationService.notifyBackofficeCreated(report);
        return incidentReportMapper.toResponse(report);
    }

    @Override
    @Transactional
    public IncidentReportResponse update(Integer incidentId, IncidentReportRequest request) {
        IncidentReport report = getAccessibleIncident(incidentId);
        IncidentStatus previousStatus = report.getStatus();

        if (request.getRoomId() != null
                && !request.getRoomId().equals(report.getRoom().getId())) {
            Room nextRoom = roomRepository
                    .findById(request.getRoomId())
                    .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
            validateRoomAccess(nextRoom);
            report.setRoom(nextRoom);
            Tenant tenant = contractRepository
                    .findByRoomIdAndStatus(nextRoom.getId(), ContractStatus.ACTIVE)
                    .map(Contract::getTenant)
                    .orElse(report.getTenant());
            report.setTenant(tenant);
        }

        report.setTitle(request.getTitle());
        report.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            report.setStatus(request.getStatus());
        }
        report.setExpectedResolveDate(request.getExpectedResolveDate());
        if (report.getStatus() == IncidentStatus.RESOLVED) {
            report.setResolvedAt(java.time.LocalDateTime.now());
        } else if (report.getStatus() != IncidentStatus.REJECTED) {
            report.setResolvedAt(null);
        }

        incidentReportRepository.save(report);
        incidentNotificationService.notifyBackofficeUpdated(report, previousStatus);
        return incidentReportMapper.toResponse(report);
    }

    @Override
    @Transactional
    public void delete(Integer incidentId) {
        IncidentReport report = getAccessibleIncident(incidentId);
        incidentNotificationService.notifyBackofficeDeleted(report);
        incidentReportRepository.delete(report);
    }

    /**
     * Lấy danh sách report phân trang.
     *
     * @param page trang (0-based)
     * @param size kích thước trang
     * @return page report DTO
     */
    @Override
    public Page<IncidentReportResponse> getAllPaged(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        if (SecurityUtils.isOwner()) {
            return incidentReportRepository
                    .findAllByRoom_BoardingHouse_Owner_Id(SecurityUtils.getCurrentUserIdOrThrow(), pageRequest)
                    .map(incidentReportMapper::toResponse);
        }
        return incidentReportRepository.findAll(pageRequest).map(incidentReportMapper::toResponse);
    }

    /**
     * Lấy danh sách report theo phòng.
     *
     * @param roomId id phòng
     * @return danh sách report DTO
     */
    @Override
    public List<IncidentReportResponse> getByRoom(Integer roomId) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        validateRoomAccess(room);
        return incidentReportRepository.findAllByRoomId(roomId).stream()
                .map(incidentReportMapper::toResponse)
                .toList();
    }

    /**
     * Lấy danh sách report theo tenant.
     *
     * @param tenantId id tenant
     * @return danh sách report DTO
     */
    @Override
    public List<IncidentReportResponse> getByTenant(Integer tenantId) {
        if (SecurityUtils.isOwner()) {
            Tenant tenant =
                    tenantRepository.findById(tenantId).orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_FOUND));
            if (tenant.getOwner() == null
                    || !tenant.getOwner().getId().equals(SecurityUtils.getCurrentUserIdOrThrow())) {
                throw new AppException(ErrorCode.ACCESS_DENIED);
            }
        }
        return incidentReportRepository.findAllByTenantId(tenantId).stream()
                .map(incidentReportMapper::toResponse)
                .toList();
    }

    private IncidentReport getAccessibleIncident(Integer incidentId) {
        if (SecurityUtils.isOwner()) {
            return incidentReportRepository
                    .findByIdAndRoom_BoardingHouse_Owner_Id(incidentId, SecurityUtils.getCurrentUserIdOrThrow())
                    .orElseThrow(() -> new AppException(ErrorCode.ACCESS_DENIED));
        }
        return incidentReportRepository.findById(incidentId).orElseThrow(() -> new AppException(ErrorCode.INVALID_KEY));
    }

    private void validateRoomAccess(Room room) {
        if (!SecurityUtils.isOwner()) {
            return;
        }
        if (room.getBoardingHouse() == null
                || room.getBoardingHouse().getOwner() == null
                || !room.getBoardingHouse().getOwner().getId().equals(SecurityUtils.getCurrentUserIdOrThrow())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
    }
}
