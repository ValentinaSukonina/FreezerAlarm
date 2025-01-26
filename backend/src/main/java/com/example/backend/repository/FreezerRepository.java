package com.example.backend.repository;

import com.example.backend.entity.Freezer;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FreezerRepository extends ListCrudRepository<Freezer, Long> {

    // Custom query to fetch only active freezers
    @Query("SELECT f FROM Freezer f WHERE f.isDeleted = false")
    List<Freezer> findAllActive();

    Optional<Freezer> findByFreezerNumber(String freezerNumber);

    List<Freezer> findByType(String type);

    List<Freezer> findByRoom(String room);

    // Soft delete by FreezerNumber
    @Modifying
    @Query("UPDATE Freezer f SET f.isDeleted = true WHERE f.freezerNumber = :freezerNumber")
    void softDeleteByFreezerNumber(@Param("freezerNumber") String freezerNumber);
}
