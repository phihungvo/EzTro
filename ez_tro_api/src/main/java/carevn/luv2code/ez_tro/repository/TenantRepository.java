package carevn.luv2code.ez_tro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.Tenant;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Integer> {}
