package com.example.backend.service;

import com.example.backend.Dto.FreezerDto;
import com.example.backend.entity.Freezer;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.FreezerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class FreezerService {

    private final FreezerRepository freezerRepository;

    public FreezerService(FreezerRepository freezerRepository) {
        this.freezerRepository = freezerRepository;
    }

    public List<Freezer> findAllActive() {
        return freezerRepository.findAllActive();
    }

    public List<Freezer> findAll() {
        return freezerRepository.findAll();
    }

    public Freezer findByFreezerNumber(String freezerNumber) {
        return freezerRepository.findByFreezerNumber(freezerNumber)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Freezer with number " + freezerNumber + " not found"));
    }

    public Freezer findById(Long id) {
        return freezerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Freezer with id " + id + " not found"));
    }

    public List<Freezer> findByType(String type) {
        return freezerRepository.findByType(type);
    }

    public List<Freezer> findByRoom(String room) {
        return freezerRepository.findByRoom(room);
    }

    public Freezer createFreezer(FreezerDto freezerDto) {
        // Check for duplicate freezer number
        if (freezerRepository.findByFreezerNumber(freezerDto.getFreezerNumber()).isPresent()) {
            throw new IllegalArgumentException(
                    "Freezer with number " + freezerDto.getFreezerNumber() + " already exists");
        }

        Freezer freezer = freezerDto.toEntity();
        freezer.setId(null); // Ensure the ID is null for a new entity
        return (Freezer) freezerRepository.save(freezer);
    }

    public Freezer updateFreezer(FreezerDto freezerDto) {
        Freezer existingFreezer = freezerRepository.findById(freezerDto.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Freezer with ID " + freezerDto.getId() + " not found"));

 freezerRepository.findByFreezerNumber(freezerDto.getFreezerNumber())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(freezerDto.getId())) {
                        throw new IllegalArgumentException(
                                "Freezer with number " + freezerDto.getFreezerNumber() + " already exists");
                    }
                });

        existingFreezer.setFileName(freezerDto.getFileName());
        existingFreezer.setFreezerNumber(freezerDto.getFreezerNumber());
        existingFreezer.setAddress(freezerDto.getAddress());
        existingFreezer.setRoom(freezerDto.getRoom());
        existingFreezer.setType(freezerDto.getType());

        return (Freezer) freezerRepository.save(existingFreezer);
    }

    @Transactional
    public void softDeleteFreezer(String freezerNumber) {
        if (!freezerRepository.findByFreezerNumber(freezerNumber).isPresent()) {
            throw new IllegalArgumentException("Freezer with number " + freezerNumber + " does not exist.");
        }
        freezerRepository.softDeleteByFreezerNumber(freezerNumber);
    }

}
