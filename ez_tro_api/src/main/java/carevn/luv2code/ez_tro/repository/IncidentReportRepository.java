package carevn.luv2code.ez_tro.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import carevn.luv2code.ez_tro.entity.IncidentReport;
import carevn.luv2code.ez_tro.entity.Tenant;
import carevn.luv2code.ez_tro.enums.IncidentStatus;

public interface IncidentReportRepository extends JpaRepository<IncidentReport, Integer> {

    List<IncidentReport> findAllByRoomId(Integer roomId);

    List<IncidentReport> findAllByTenant(Tenant tenant);

    List<IncidentReport> findAllByTenantId(Integer tenantId);

    Page<IncidentReport> findAllByRoom_BoardingHouse_Owner_Id(Integer ownerId, Pageable pageable);

    Optional<IncidentReport> findByIdAndRoom_BoardingHouse_Owner_Id(Integer id, Integer ownerId);

    List<IncidentReport> findByStatusInAndExpectedResolveDateBefore(
            List<IncidentStatus> statuses, LocalDate expectedResolveDate);

    List<IncidentReport> findByStatusAndCreatedAtBefore(IncidentStatus status, LocalDateTime createdAtBefore);
}
