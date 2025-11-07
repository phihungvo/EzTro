package carevn.luv2code.ez_tro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.BoardingHouse;

@Repository
public interface BoardingHouseRepository
        extends JpaRepository<BoardingHouse, Integer>, JpaSpecificationExecutor<BoardingHouse> {
    boolean existsByName(String name);
}
