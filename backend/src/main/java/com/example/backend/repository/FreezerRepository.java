package com.example.backend.repository;

import com.example.backend.entity.Freezer;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FreezerRepository extends ListCrudRepository<Freezer, Long>{

    Optional<Freezer> findByNumber(String number);
}
