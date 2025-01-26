package com.example.backend.repository;

import com.example.backend.entity.Freezer;
import com.example.backend.entity.FreezerUser;
import com.example.backend.entity.User;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FreezerUserRepository extends ListCrudRepository<FreezerUser, Long> {
/*
    List<FreezerUser> findbyFreezerNumber(String freezerNumber);

    List<FreezerUser> findbyUserName(String userName);

    // Find by Freezer and User (to check for unique constraints)
    Optional<FreezerUser> findByFreezerNumberAndUserName(String freezerNumber, String userName);
    int deleteByFreezer_FreezerNumber(String freezerNumber);
    int deleteByFreezer_FreezerNumberAndUser_UserName(String freezerNumber, String userName);

    Optional<FreezerUser> findByFreezer_FreezerNumberAndUser_UserName(String freezerNumber, String userName);
*/

}
