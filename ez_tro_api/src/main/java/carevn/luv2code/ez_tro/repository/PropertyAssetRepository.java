package carevn.luv2code.ez_tro.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import carevn.luv2code.ez_tro.entity.PropertyAsset;

public interface PropertyAssetRepository
        extends JpaRepository<PropertyAsset, Integer>, JpaSpecificationExecutor<PropertyAsset> {

    @EntityGraph(attributePaths = {"boardingHouse", "building", "room", "histories"})
    Optional<PropertyAsset> findByIdAndIsDeletedFalse(Integer id);

    // Check for existing asset code or serial number (case-insensitive) among non-deleted assets
    boolean existsByAssetCodeIgnoreCaseAndIsDeletedFalse(String assetCode);

    // When updating, exclude the current asset by ID to allow keeping the same code/serial number
    boolean existsByAssetCodeIgnoreCaseAndIdNotAndIsDeletedFalse(String assetCode, Integer id);

    // Serial number is optional, so only check if it's provided and not empty
    boolean existsBySerialNumberIgnoreCaseAndIsDeletedFalse(String serialNumber);

    boolean existsBySerialNumberIgnoreCaseAndIdNotAndIsDeletedFalse(String serialNumber, Integer id);

    @EntityGraph(attributePaths = {"boardingHouse", "building", "room"})
    List<PropertyAsset> findByRoomIdAndIsDeletedFalse(Integer roomId);
}
