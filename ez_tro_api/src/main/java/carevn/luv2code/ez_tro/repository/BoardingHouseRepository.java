package carevn.luv2code.ez_tro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.BoardingHouse;

@Repository
public interface BoardingHouseRepository
        extends JpaRepository<BoardingHouse, Integer>, JpaSpecificationExecutor<BoardingHouse> {
    boolean existsByName(String name);

    @Query("SELECT COUNT(bh) FROM BoardingHouse bh WHERE bh.owner.id = :ownerId")
    long countByOwnerId(@Param("ownerId") Integer ownerId);

    @Query("SELECT bh FROM BoardingHouse bh WHERE bh.owner.id = :ownerId")
    java.util.List<BoardingHouse> findByOwnerId(@Param("ownerId") Integer ownerId);
}
