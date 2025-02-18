package com.example.backend.repository;

import com.example.backend.dto.FreezerWithUsersDTO;
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

    Optional<Freezer> findById(Long id);

    @Override
    List<Freezer> findAll();

    @Modifying
    @Transactional
    @Query("UPDATE Freezer f SET f.file = :file, f.address = :address, f.room = :room, f.type = :type WHERE f.number = :number")
    int updateFreezerDetailsByNumber(@Param("file") String file,
                                     @Param("address") String address,
                                     @Param("room") String room,
                                     @Param("type") String type,
                                     @Param("number") String number);

    @Modifying
    @Transactional
    @Query("DELETE FROM Freezer f WHERE f.number = :number")
    int deleteByNumber(@Param("number") String number);

    // Get all freezers with users
    @Query("SELECT DISTINCT f FROM Freezer f "
            + "LEFT JOIN FETCH f.freezerUsers fu "
            + "LEFT JOIN FETCH fu.user")
    List<Freezer> findAllWithUsers();

    //Get freezer with number
    @Query("SELECT f FROM Freezer f WHERE f.number = :number")
    Optional<Freezer> findByNumber(@Param("number") String number);

    // Get freezer with users by number
    @Query("SELECT DISTINCT f FROM Freezer f " +
            "LEFT JOIN FETCH f.freezerUsers fu " +
            "LEFT JOIN FETCH fu.user " +
            "WHERE f.number = :number")
    Freezer findByNumberWithUsers(@Param("number") String number);

}
