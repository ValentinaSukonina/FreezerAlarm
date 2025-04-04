package com.example.backend.repository;

import com.example.backend.dto.FreezerDTO;
import com.example.backend.entity.Freezer;
import com.example.backend.entity.FreezerUser;
import com.example.backend.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FreezerUserRepository extends ListCrudRepository<FreezerUser, Long> {
    boolean existsByUserIdAndFreezerId(Long userId, Long freezerId);

    Optional<FreezerUser> findByFreezerAndUser(Freezer freezer, User user);

    List<FreezerUser> findByFreezerId(Long freezerId);

    @Modifying
    @Transactional
    @Query("DELETE FROM FreezerUser f WHERE f.freezer = :freezer AND f.user = :user")
    int deleteByFreezerAndUser(@Param("freezer") Freezer freezer, @Param("user") User user);

    @Query("SELECT u FROM FreezerUser fu JOIN fu.user u JOIN fu.freezer f WHERE f.number = :freezerNumber")
    List<User> findUsersByFreezerNumber(@Param("freezerNumber") String freezerNumber);

    @Transactional
    @Modifying
    @Query("DELETE FROM FreezerUser fu WHERE fu.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

   /* @Query("SELECT fu.freezer FROM FreezerUser fu WHERE fu.user.id = :userId")
    List<FreezerDTO> findFreezersByUserId(@Param("userId") Long userId);*/

    List<FreezerUser> findByUserId(Long userID);

    // Adjust this query to use FreezerDTO projection
    @Query("SELECT new com.example.backend.dto.FreezerDTO(f.id, f.file, f.number, f.address, f.room, f.type) " +
            "FROM FreezerUser fu JOIN fu.freezer f WHERE fu.user.id = :userId")
    List<FreezerDTO> findFreezersByUserId(@Param("userId") Long userId);

    @Transactional
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM FreezerUser fu WHERE fu.freezer.id = :freezerId")
    void deleteByFreezerId(@Param("freezerId") Long freezerId);
}





