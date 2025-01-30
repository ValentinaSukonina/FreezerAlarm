package com.example.backend.service;

import com.example.backend.entity.Freezer;
import com.example.backend.exception.Exceptions;
import com.example.backend.repository.FreezerRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import static org.springframework.util.ClassUtils.isPresent;

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

    public Freezer findByNumber(String number) {
        return freezerRepository.findByNumber(number)
                .orElseThrow(() -> new Exceptions.NotFoundException(
                        "Freezer with number " + number + " not found"));
    }

    public Freezer findById(Long id) {
        return freezerRepository.findById(id)
                .orElseThrow(() -> new Exceptions.NotFoundException("Freezer with ID " + id + " not found"));
    }

    public List<Freezer> findAll() {
        return freezerRepository.findAll();
    }

    public Freezer updateFreezerDetailsByNumber(String number, Freezer freezer) {
        Freezer toUpdate = freezerRepository.findByNumber(number)
                .orElseThrow(() -> new Exceptions.NotFoundException("Freezer with number " + number + " not found."));

        toUpdate.setRoom(freezer.getRoom());
        toUpdate.setAddress(freezer.getAddress());
        toUpdate.setType(freezer.getType());

        return freezerRepository.save(toUpdate);
    }
}











