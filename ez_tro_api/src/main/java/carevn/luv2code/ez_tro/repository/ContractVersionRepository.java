package carevn.luv2code.ez_tro.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.ContractVersion;

@Repository
public interface ContractVersionRepository extends JpaRepository<ContractVersion, Integer> {
    List<ContractVersion> findByContractIdOrderByVersionNumberDesc(Integer contractId);

    Optional<ContractVersion> findTopByContractIdOrderByVersionNumberDesc(Integer contractId);

    Optional<ContractVersion> findFirstByContractIdAndEffectiveFromLessThanEqualAndEffectiveToGreaterThanEqual(
            Integer contractId, LocalDate asOfDate, LocalDate sameDate);

    Optional<ContractVersion>
            findFirstByContractIdAndEffectiveFromLessThanEqualAndEffectiveToGreaterThanEqualOrderByVersionNumberDesc(
                    Integer contractId, LocalDate asOfDate, LocalDate sameDate);

    Optional<ContractVersion>
            findFirstByContractIdAndEffectiveFromLessThanEqualAndEffectiveToIsNullOrderByVersionNumberDesc(
                    Integer contractId, LocalDate asOfDate);

    @Query(
            """
		SELECT v FROM ContractVersion v
		WHERE v.contract.id = :contractId
		AND v.effectiveFrom <= :periodEnd
		AND (v.effectiveTo IS NULL OR v.effectiveTo >= :periodStart)
		ORDER BY v.effectiveFrom ASC, v.versionNumber DESC
		""")
    List<ContractVersion> findOverlappingVersions(
            @Param("contractId") Integer contractId,
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd);
}
