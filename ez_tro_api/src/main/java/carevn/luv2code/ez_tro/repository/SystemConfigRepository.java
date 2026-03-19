package carevn.luv2code.ez_tro.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import carevn.luv2code.ez_tro.entity.SystemConfig;

public interface SystemConfigRepository extends JpaRepository<SystemConfig, Integer> {
    boolean existsByKey(String key);

    java.util.List<SystemConfig> findAllByOrderByKeyAsc();

    Optional<SystemConfig> findByKey(String key);
}
