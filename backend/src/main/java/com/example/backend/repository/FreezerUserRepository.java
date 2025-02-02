package com.example.backend.repository;

import com.example.backend.entity.Freezer;
import com.example.backend.entity.FreezerUser;
import com.example.backend.entity.User;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FreezerUserRepository extends ListCrudRepository<FreezerUser, Long> {

    Optional<FreezerUser> findByFreezerAndUser(Freezer freezer, User user);

    boolean existsByUserIdAndFreezerId(Long userId, Long freezerId);
}
