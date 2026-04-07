package carevn.luv2code.ez_tro.service.admin;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;

import carevn.luv2code.ez_tro.dto.requests.ContractAmendmentCreateRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractBillingRuleCreateRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractRenewRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractRoomTransferRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractTerminateRequest;
import carevn.luv2code.ez_tro.dto.requests.ContractViolationRequest;
import carevn.luv2code.ez_tro.dto.requests.DepositTransactionCreateRequest;
import carevn.luv2code.ez_tro.dto.response.BillResponse;
import carevn.luv2code.ez_tro.dto.response.ContractAmendmentSummaryResponse;
import carevn.luv2code.ez_tro.dto.response.ContractBillingRuleSummaryResponse;
import carevn.luv2code.ez_tro.dto.response.ContractDetailResponse;
import carevn.luv2code.ez_tro.dto.response.ContractResponse;
import carevn.luv2code.ez_tro.dto.response.ContractRoomTransferResponse;
import carevn.luv2code.ez_tro.dto.response.ContractSnapshotResponse;
import carevn.luv2code.ez_tro.dto.response.ContractVersionSummaryResponse;
import carevn.luv2code.ez_tro.dto.response.DepositTransactionSummaryResponse;

/**
 * Service contract cho nghiệp vụ Hợp đồng (Contract) phía admin/owner.
 *
 * <p>Chi tiết rule/versioning/settlement nằm ở implementation.
 */
public interface ContractService {
    ContractResponse create(ContractRequest request);

    ContractResponse update(Integer id, ContractRequest request);

    void delete(Integer id);

    ContractDetailResponse getById(Integer id);

    List<ContractResponse> getAll();

    List<ContractResponse> getAllActiveContracts();

    Page<ContractResponse> getAllContractPaged(int page, int size);

    List<ContractResponse> getByRoom(Integer roomId);

    List<ContractResponse> getByTenant(Integer tenantId);

    List<BillResponse> getBillsByContract(Integer contractId);

    BillResponse createBillForContract(Integer contractId, Object billRequestObj);

    //    Page<ContractResponse> filterContracts(
    //            String search, String startDate, String endDate, String status, int page, int size);

    Page<ContractResponse> filterContracts(
            String search,
            String startDate,
            String endDate,
            String status,
            Integer boardingHouseId,
            Integer roomId,
            int page,
            int size);

    int backfillContractFoundation();

    ContractVersionSummaryResponse getCurrentVersion(Integer contractId, LocalDate asOfDate);

    ContractSnapshotResponse getSnapshot(Integer contractId, LocalDate asOfDate);

    ContractAmendmentSummaryResponse createAmendment(Integer contractId, ContractAmendmentCreateRequest request);

    ContractAmendmentSummaryResponse reviseAmendment(
            Integer contractId, Integer amendmentId, ContractAmendmentCreateRequest request);

    ContractBillingRuleSummaryResponse createBillingRule(Integer contractId, ContractBillingRuleCreateRequest request);

    ContractBillingRuleSummaryResponse reviseBillingRule(
            Integer contractId, Integer billingRuleId, ContractBillingRuleCreateRequest request);

    ContractBillingRuleSummaryResponse deactivateBillingRule(Integer contractId, Integer billingRuleId);

    DepositTransactionSummaryResponse createDepositTransaction(
            Integer contractId, DepositTransactionCreateRequest request);

    ContractDetailResponse finalizeSettlement(Integer contractId);

    ContractDetailResponse terminate(Integer contractId, ContractTerminateRequest request);

    ContractDetailResponse renew(Integer contractId, ContractRenewRequest request);

    ContractDetailResponse markViolated(Integer contractId, ContractViolationRequest request);

    ContractRoomTransferResponse transferRoom(Integer contractId, ContractRoomTransferRequest request);

    int processAutoRenewals(LocalDate today);
}
