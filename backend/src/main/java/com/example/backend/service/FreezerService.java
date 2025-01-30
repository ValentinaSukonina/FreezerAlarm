package com.example.backend.service;

import com.example.backend.entity.Freezer;
import com.example.backend.exception.Exceptions;
import com.example.backend.repository.FreezerRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Transactional
public class FreezerService {

    private final FreezerRepository freezerRepository;

    public FreezerService(FreezerRepository freezerRepository) {
        this.freezerRepository = freezerRepository;
    }

    public Freezer createFreezer(Freezer freezer) {
        Optional<Freezer> existingFreezer = freezerRepository.findByNumber(freezer.getNumber());
        if (existingFreezer.isPresent()) {
            throw new Exceptions.FreezerAlreadyExistsException("Freezer with serial number "
                    + freezer.getNumber() + " already exists.");
        }

        return freezerRepository.save(freezer);
    }

}





/*
    public Freezer findById(Long id) throws Throwable {
        return freezerRepository.findById(id)
                .<Freezer>orElseThrow(() -> new ResourceNotFoundException("Freezer with id " + id + " not found"));
    }

 */


