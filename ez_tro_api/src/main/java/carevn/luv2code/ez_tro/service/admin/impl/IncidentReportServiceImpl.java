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

        Tenant tenant = contractRepository
                .findByRoomIdAndStatus(room.getId(), ContractStatus.ACTIVE)
                .map(Contract::getTenant)
                .orElse(null);

        IncidentReport report = IncidentReport.builder()
                .room(room)
                .tenant(tenant)
                .title(request.getTitle())
                .description(request.getDescription())
                .status(IncidentStatus.PENDING)
                .build();

        incidentReportRepository.save(report);
        return incidentReportMapper.toResponse(report);
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
        return incidentReportRepository.findAllByTenantId(tenantId).stream()
                .map(incidentReportMapper::toResponse)
                .toList();
    }
}
