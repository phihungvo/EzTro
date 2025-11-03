package carevn.luv2code.ez_tro.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import carevn.luv2code.ez_tro.entity.IncidentReport;
import carevn.luv2code.ez_tro.entity.Tenant;

public interface IncidentReportRepository extends JpaRepository<IncidentReport, Integer> {

    List<IncidentReport> findAllByRoomId(Integer roomId);

    List<IncidentReport> findAllByTenant(Tenant tenant);

    List<IncidentReport> findAllByTenantId(Integer tenantId);
}
