package carevn.luv2code.ez_tro.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import carevn.luv2code.ez_tro.entity.RoomUtility;
import carevn.luv2code.ez_tro.entity.RoomUtilityId;

@Repository
public interface RoomUtilityRepository extends JpaRepository<RoomUtility, RoomUtilityId> {

    List<RoomUtility> findByRoomId(Integer roomId);

    @Query("SELECT ru FROM RoomUtility ru WHERE ru.room.id = :roomId AND ru.utility.isActive = true")
    List<RoomUtility> findActiveByRoomId(@Param("roomId") Integer roomId);

    @Query("SELECT ru FROM RoomUtility ru WHERE ru.utility.id = :utilityId")
    List<RoomUtility> findByUtilityId(@Param("utilityId") Integer utilityId);

    @Query("SELECT ru FROM RoomUtility ru WHERE ru.room.id = :roomId")
    Page<RoomUtility> findByRoomIdPaged(@Param("roomId") Integer roomId, Pageable pageable);

    @Query("SELECT ru FROM RoomUtility ru")
    Page<RoomUtility> findAllPaged(Pageable pageable);

    Page<RoomUtility> findAllByRoom_BoardingHouse_Owner_Id(Integer ownerId, Pageable pageable);
}
