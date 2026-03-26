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

/**
 * Service xử lý báo cáo sự cố (Incident Report) phía người thuê.
 *
 * <p>Luồng tạo report gắn theo tenant hiện tại và hợp đồng active.
 */
@Service
@RequiredArgsConstructor
public class IncidentReportUserServiceImpl implements IncidentReportUserService {

    private final IncidentReportRepository incidentReportRepository;
    private final TenantRepository tenantRepository;
    private final RoomRepository roomRepository;
    private final IncidentReportMapper incidentReportMapper;
    private final ContractRepository contractRepository;

    /**
     * Tạo mới incident report cho user hiện tại.
     *
     * @param userId id user
     * @param request payload tạo report
     * @return report DTO sau khi tạo
     */
    @Override
    @Transactional
    public IncidentReportResponse create(Integer userId, IncidentReportRequest request) {
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

    /**
     * Lấy danh sách incident reports của user hiện tại.
     *
     * @param userId id user
     * @return danh sách report DTO
     */
    @Override
    public List<IncidentReportResponse> getAllByUserId(Integer userId) {

        Tenant tenant = tenantRepository
                .findByUserId(userId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tenant cho user ID: " + userId));
        List<IncidentReport> response = incidentReportRepository.findAllByTenant(tenant);

        return response.stream().map(incidentReportMapper::toResponse).collect(Collectors.toList());
    }

    /**
     * Cập nhật incident report theo id.
     *
     * <p>Lưu ý: một số validate ownership/trạng thái đang được comment out (TODO).
     *
     * @param userId id user
     * @param reportId id report
     * @param request payload cập nhật
     * @return report DTO sau cập nhật
     */
    @Override
    @Transactional
    public IncidentReportResponse update(Integer userId, Integer reportId, IncidentReportRequest request) {
        //        Tenant tenant = tenantRepository
        //                .findByUserId(userId)
        //                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tenant cho user ID: " +
        // userId));

        IncidentReport report = incidentReportRepository
                .findById(reportId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy báo cáo sự cố với ID: " + reportId));

        // Đảm bảo chỉ chủ báo cáo mới được cập nhật
        //        if (!report.getTenant().getId().equals(tenant.getId())) {
        //            throw new AppException(ErrorCode.ACCESS_DENIED);
        //        }

        // Chỉ được sửa khi chưa xử lý xong
        //        if (report.getStatus() == IncidentStatus.RESOLVED || report.getStatus() == IncidentStatus.REJECTED) {
        //            throw new AppException(ErrorCode.CANNOT_EDIT_RESOLVED_INCIDENT);
        //        }

        report.setTitle(request.getTitle());
        report.setDescription(request.getDescription());
        report.setStatus(request.getStatus());
        report.setExpectedResolveDate(request.getExpectedResolveDate());

        incidentReportRepository.save(report);
        return incidentReportMapper.toResponse(report);
    }

    /**
     * Xóa incident report theo id.
     *
     * @param reportId id report
     */
    @Override
    @Transactional
    public void delete(Integer reportId) {
        IncidentReport report = incidentReportRepository
                .findById(reportId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy báo cáo sự cố với ID: " + reportId));

        incidentReportRepository.delete(report);
    }
}
