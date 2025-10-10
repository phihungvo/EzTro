package carevn.luv2code.ez_tro.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.File;

@Repository
public interface FileRepository extends JpaRepository<File, Integer> {
    Optional<File> findByFileName(String fileName);

    boolean existsByFileName(String fileName);
}
