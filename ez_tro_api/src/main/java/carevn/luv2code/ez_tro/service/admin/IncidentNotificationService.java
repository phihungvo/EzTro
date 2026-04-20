package carevn.luv2code.ez_tro.service.admin;

import carevn.luv2code.ez_tro.entity.IncidentReport;
import carevn.luv2code.ez_tro.enums.IncidentStatus;

public interface IncidentNotificationService {
    void notifyTenantCreated(IncidentReport report);

    void notifyTenantUpdated(IncidentReport report);

    void notifyTenantDeleted(IncidentReport report);

    void notifyBackofficeCreated(IncidentReport report);

    void notifyBackofficeUpdated(IncidentReport report, IncidentStatus previousStatus);

    void notifyBackofficeDeleted(IncidentReport report);

    int sendSlaEscalations();
}
