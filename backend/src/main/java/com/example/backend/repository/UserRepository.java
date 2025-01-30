package com.example.backend.repository;


import com.example.backend.entity.Freezer;
import com.example.backend.entity.User;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends ListCrudRepository <User,Long> {

    Optional<User> findByID(Long id);

}
