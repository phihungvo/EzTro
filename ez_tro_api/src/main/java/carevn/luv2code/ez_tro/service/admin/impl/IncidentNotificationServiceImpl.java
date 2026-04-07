package carevn.luv2code.ez_tro.service.admin.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import carevn.luv2code.ez_tro.entity.IncidentReport;
import carevn.luv2code.ez_tro.entity.User;
import carevn.luv2code.ez_tro.enums.IncidentStatus;
import carevn.luv2code.ez_tro.repository.IncidentReportRepository;
import carevn.luv2code.ez_tro.repository.UserRepository;
import carevn.luv2code.ez_tro.service.admin.IncidentNotificationService;
import carevn.luv2code.ez_tro.service.admin.NotificationService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class IncidentNotificationServiceImpl implements IncidentNotificationService {

    private final NotificationService notificationService;
    private final IncidentReportRepository incidentReportRepository;
    private final UserRepository userRepository;

    @Value("${app.incidents.notification.escalation.pending-hours:48}")
    private long pendingEscalationHours;

    @Override
    public void notifyTenantCreated(IncidentReport report) {
        User owner = resolveOwner(report);
        if (owner != null && owner.getId() != null) {
            notificationService.sendToUser(
                    owner.getId(),
                    "Có báo cáo sự cố mới",
                    buildOwnerMessage(report, "Người thuê vừa gửi một báo cáo sự cố mới"),
                    "OWNER_INCIDENT_CREATED",
                    buildPayload(report, Map.of("source", "TENANT_CREATE")));
        }

        User tenantUser = resolveTenantUser(report);

        if (tenantUser != null && tenantUser.getId() != null) {
            notificationService.sendToUser(
                    tenantUser.getId(),
                    "Đã gửi báo cáo sự cố",
                    buildTenantMessage(report, "Yêu cầu sự cố của bạn đã được hệ thống ghi nhận"),
                    "TENANT_INCIDENT_RECEIVED",
                    buildPayload(
                            report,
                            Map.of(
                                    "source",
                                    "TENANT_CREATE_ACK",
                                    "dedupeKey",
                                    "tenant-incident-received-" + report.getId())));
        }
    }

    @Override
    public void notifyTenantUpdated(IncidentReport report) {
        User owner = resolveOwner(report);
        if (owner == null) {
            return;
        }

        notificationService.sendToUser(
                owner.getId(),
                "Báo cáo sự cố đã được cập nhật",
                buildOwnerMessage(report, "Người thuê vừa cập nhật nội dung báo cáo sự cố"),
                "OWNER_INCIDENT_UPDATED",
                buildPayload(report, Map.of("source", "TENANT_UPDATE")));
    }

    @Override
    public void notifyTenantDeleted(IncidentReport report) {
        User owner = resolveOwner(report);
        if (owner == null) {
            return;
        }

        notificationService.sendToUser(
                owner.getId(),
                "Báo cáo sự cố đã bị hủy",
                buildOwnerMessage(report, "Người thuê đã xóa báo cáo sự cố trước khi xử lý"),
                "OWNER_INCIDENT_UPDATED",
                buildPayload(report, Map.of("source", "TENANT_DELETE", "updateType", "CANCELLED")));
    }

    @Override
    public void notifyBackofficeCreated(IncidentReport report) {
        User tenantUser = resolveTenantUser(report);
        if (tenantUser == null) {
            return;
        }

        notificationService.sendToUser(
                tenantUser.getId(),
                "Quản lý vừa tạo báo cáo sự cố",
                buildTenantMessage(report, "Quản lý vừa tạo một báo cáo sự cố cho phòng của bạn"),
                "INCIDENT_CREATED_BY_BACKOFFICE",
                buildPayload(report, Map.of("source", "BACKOFFICE_CREATE")));
    }

    /**
     * Thực thi notify backoffice updated.
     *
     * @param report         tham số report
     * @param previousStatus tham số previousStatus
     */
    @Override
    public void notifyBackofficeUpdated(IncidentReport report, IncidentStatus previousStatus) {
        User tenantUser = resolveTenantUser(report);
        if (tenantUser == null) {
            return;
        }

        boolean statusChanged = previousStatus != report.getStatus();
        String eventKey = resolveStatusEventKey(report.getStatus(), statusChanged);
        String title =
                switch (report.getStatus()) {
                    case IN_PROGRESS -> "Sự cố đang được xử lý";
                    case RESOLVED -> "Sự cố đã được xử lý";
                    case REJECTED -> "Yêu cầu sự cố bị từ chối";
                    case PENDING -> "Báo cáo sự cố đã được cập nhật";
                };
        String message = statusChanged
                ? buildTenantMessage(report, "Trạng thái xử lý sự cố của bạn vừa được cập nhật")
                : buildTenantMessage(report, "Thông tin xử lý sự cố vừa được quản lý cập nhật");
        Map<String, Object> extra = new LinkedHashMap<>();
        extra.put("source", "BACKOFFICE_UPDATE");
        extra.put("previousStatus", previousStatus != null ? previousStatus.name() : null);

        notificationService.sendToUser(tenantUser.getId(), title, message, eventKey, buildPayload(report, extra));
    }

    /**
     * Thực thi notify backoffice deleted.
     *
     * @param report tham số report
     */
    @Override
    public void notifyBackofficeDeleted(IncidentReport report) {
        User tenantUser = resolveTenantUser(report);
        if (tenantUser == null) {
            return;
        }

        notificationService.sendToUser(
                tenantUser.getId(),
                "Báo cáo sự cố đã được đóng",
                buildTenantMessage(report, "Quản lý đã xóa hoặc đóng báo cáo sự cố này"),
                "INCIDENT_DELETED_BY_BACKOFFICE",
                buildPayload(report, Map.of("source", "BACKOFFICE_DELETE")));
    }

    /**
     * Gửi sla escalations.
     *
     * @return kết quả kiểu int
     */
    @Override
    public int sendSlaEscalations() {
        List<IncidentReport> overdueByExpectedDate =
                incidentReportRepository.findByStatusInAndExpectedResolveDateBefore(
                        List.of(IncidentStatus.PENDING, IncidentStatus.IN_PROGRESS), LocalDate.now());
        List<IncidentReport> stalePending = incidentReportRepository.findByStatusAndCreatedAtBefore(
                IncidentStatus.PENDING, LocalDateTime.now().minusHours(pendingEscalationHours));

        Map<Integer, IncidentReport> incidents = new LinkedHashMap<>();
        overdueByExpectedDate.forEach(report -> incidents.put(report.getId(), report));
        stalePending.forEach(report -> incidents.put(report.getId(), report));

        int processed = 0;
        for (IncidentReport report : incidents.values()) {
            List<Integer> adminIds = userRepository.findAllAdmins().stream()
                    .map(User::getId)
                    .filter(id -> id != null)
                    .distinct()
                    .toList();
            User owner = resolveOwner(report);
            if (owner != null && owner.getId() != null) {
                notificationService.sendToUser(
                        owner.getId(),
                        "Sự cố quá SLA cần xử lý",
                        buildOwnerMessage(report, "Báo cáo sự cố đang quá hạn xử lý hoặc pending quá lâu"),
                        "OWNER_INCIDENT_SLA_BREACH",
                        buildPayload(
                                report,
                                Map.of(
                                        "source",
                                        "SLA_ESCALATION",
                                        "dedupeKey",
                                        "owner-incident-sla-" + report.getId() + "-" + LocalDate.now())));
            }

            if (!adminIds.isEmpty()) {
                notificationService.sendToUsers(
                        adminIds,
                        "Sự cố quá SLA cần xử lý",
                        buildOwnerMessage(report, "Báo cáo sự cố đang quá hạn xử lý hoặc pending quá lâu"),
                        "ADMIN_INCIDENT_SLA_BREACH",
                        buildPayload(
                                report,
                                Map.of(
                                        "source",
                                        "SLA_ESCALATION",
                                        "dedupeKey",
                                        "admin-incident-sla-" + report.getId() + "-" + LocalDate.now())));
            }
            processed++;
        }
        return processed;
    }

    /**
     * Thực thi resolve status event key.
     *
     * @param status        tham số status
     * @param statusChanged tham số statusChanged
     * @return kết quả kiểu String
     */

    private String resolveStatusEventKey(IncidentStatus status, boolean statusChanged) {
        if (!statusChanged) {
            return "INCIDENT_UPDATED_BY_BACKOFFICE";
        }
        return switch (status) {
            case IN_PROGRESS -> "INCIDENT_IN_PROGRESS";
            case RESOLVED -> "INCIDENT_RESOLVED";
            case REJECTED -> "INCIDENT_REJECTED";
            case PENDING -> "INCIDENT_REOPENED";
        };
    }

    /**
     * Xây dựng payload.
     *
     * @param report tham số report
     * @param extra  tham số extra
     * @return kết quả kiểu
     */

    private Map<String, Object> buildPayload(IncidentReport report, Map<String, Object> extra) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("incidentId", report.getId());
        payload.put("roomId", report.getRoom() != null ? report.getRoom().getId() : null);
        payload.put("tenantId", report.getTenant() != null ? report.getTenant().getId() : null);
        payload.put("roomNumber", report.getRoom() != null ? report.getRoom().getRoomNumber() : null);
        payload.put("status", report.getStatus() != null ? report.getStatus().name() : null);
        payload.put(
                "expectedResolveDate",
                report.getExpectedResolveDate() != null
                        ? report.getExpectedResolveDate().toString()
                        : null);
        if (extra != null) {
            payload.putAll(extra);
        }
        return payload;
    }

    /**
     * Xây dựng owner message.
     *
     * @param report tham số report
     * @param prefix tham số prefix
     * @return kết quả kiểu String
     */

    private String buildOwnerMessage(IncidentReport report, String prefix) {
        return prefix + ": #" + report.getId() + " - " + report.getTitle() + " (" + resolveRoomLabel(report) + ")";
    }

    /**
     * Xây dựng tenant message.
     *
     * @param report tham số report
     * @param prefix tham số prefix
     * @return kết quả kiểu String
     */

    private String buildTenantMessage(IncidentReport report, String prefix) {
        return prefix + ": #" + report.getId() + " - " + report.getTitle() + " (" + resolveRoomLabel(report) + ")";
    }

    /**
     * Thực thi resolve room label.
     *
     * @param report tham số report
     * @return kết quả kiểu String
     */

    private String resolveRoomLabel(IncidentReport report) {
        if (report.getRoom() == null) {
            return "không rõ phòng";
        }
        String roomNumber = report.getRoom().getRoomNumber();
        String buildingName = report.getRoom().getBuilding() != null
                ? report.getRoom().getBuilding().getName()
                : null;
        return buildingName != null ? roomNumber + " - " + buildingName : roomNumber;
    }

    /**
     * Thực thi resolve owner.
     *
     * @param report tham số report
     * @return kết quả kiểu User
     */

    private User resolveOwner(IncidentReport report) {
        if (report == null || report.getRoom() == null || report.getRoom().getBoardingHouse() == null) {
            return null;
        }
        return report.getRoom().getBoardingHouse().getOwner();
    }

    private User resolveTenantUser(IncidentReport report) {
        if (report == null || report.getTenant() == null) {
            return null;
        }
        return report.getTenant().getUser();
    }
}
