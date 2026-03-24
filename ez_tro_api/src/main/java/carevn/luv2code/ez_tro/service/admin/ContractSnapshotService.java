package carevn.luv2code.ez_tro.service.admin;

import java.time.LocalDate;

import carevn.luv2code.ez_tro.dto.response.ContractSnapshotResponse;
import carevn.luv2code.ez_tro.dto.response.ContractVersionSummaryResponse;
import carevn.luv2code.ez_tro.entity.Contract;
import carevn.luv2code.ez_tro.entity.ContractVersion;

public interface ContractSnapshotService {
    ContractVersion resolveEffectiveVersionEntity(Contract contract, LocalDate asOfDate);

    ContractVersionSummaryResponse getCurrentVersion(Integer contractId, LocalDate asOfDate);

    ContractSnapshotResponse getSnapshot(Integer contractId, LocalDate asOfDate);
}
