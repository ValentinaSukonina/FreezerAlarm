package com.example.backend.repository;

import com.example.backend.entity.Freezer;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FreezerRepository extends ListCrudRepository<Freezer, Long> {
    Optional<Freezer> findByNumber(String number);

    List<Freezer> findByType(String type);

    List<Freezer> findByRoom(String room);

    // Custom delete by freezer number
    @Modifying
    void deleteByNumber(String number);

    // Update freezer placement
    @Modifying
    @Transactional
    @Query("UPDATE Freezer f SET f.room = :room, f.address = :address WHERE f.number = :number")
    void updateFreezerDetailsByNumber(@Param("room") String room,
                                      @Param("address") String address,
                                      @Param("type") String type,
                                      @Param("number") String number);
}


