package carevn.luv2code.ez_tro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.BoardingHouse;

@Repository
public interface BoardingHouseRepository extends JpaRepository<BoardingHouse, Integer> {
    boolean existsByName(String name);
}
