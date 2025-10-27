package carevn.luv2code.ez_tro.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.File;

@Repository
public interface FileRepository extends JpaRepository<File, Integer> {
    Optional<File> findByFileName(String fileName);

    boolean existsByFileName(String fileName);

    // Trong FileRepository extends JpaRepository<File, Integer>
    @Query("SELECT f FROM File f WHERE f.contract.id = :contractId AND f.isDeleted = false ORDER BY f.uploadDate DESC")
    Page<File> findByContractIdAndDeletedFalse(@Param("contractId") Integer contractId, Pageable pageable);

    @Query("SELECT COUNT(f) FROM File f WHERE f.contract.id = :contractId AND f.isDeleted = false")
    Long countByContractIdAndDeletedFalse(@Param("contractId") Integer contractId);

    Optional<File> findByIdAndIsDeletedFalse(Integer id);
}
