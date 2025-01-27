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

    public Freezer findById(Long id) {
        return freezerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Freezer with id " + id + " not found"));
    }

    public List<Freezer> findAll() {
        return freezerRepository.findAll();
    }

    public Freezer findByNumber(String number) {
        return freezerRepository.findByNumber(number)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Freezer with number " + number + " not found"));
    }

    public List<Freezer> findByType(String type) {
        return freezerRepository.findByType(type);
    }

    public List<Freezer> findByRoom(String room) {
        return freezerRepository.findByRoom(room);
    }

    public Freezer createFreezer(FreezerDto freezerDto) {
        // Check for duplicate freezer number
        if (freezerRepository.findByNumber(freezerDto.getNumber()).isPresent()) {
            throw new IllegalArgumentException(
                    "Freezer with number " + freezerDto.getNumber() + " already exists");
        }

        Freezer freezer = freezerDto.toEntity();
        freezer.setId(null); // Ensure the ID is null for a new entity
        return (Freezer) freezerRepository.save(freezer);
    }

    public Freezer updateFreezer(FreezerDto freezerDto) {
        Freezer existingFreezer = freezerRepository.findById(freezerDto.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Freezer with ID " + freezerDto.getId() + " not found"));

 freezerRepository.findByNumber(freezerDto.getNumber())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(freezerDto.getId())) {
                        throw new IllegalArgumentException(
                                "Freezer with number " + freezerDto.getNumber() + " already exists");
                    }
                });

 existingFreezer.setFile(freezerDto.getFile());

        existingFreezer.setNumber(freezerDto.getNumber());
        existingFreezer.setAddress(freezerDto.getAddress());
        existingFreezer.setRoom(freezerDto.getRoom());
        existingFreezer.setType(freezerDto.getType());

        return (Freezer) freezerRepository.save(existingFreezer);
    }

    @Transactional
    public void deleteFreezer(String number) {
        if (!freezerRepository.findByNumber(number).isPresent()) {
            throw new IllegalArgumentException("Freezer with number " + number + " does not exist.");
        }
        freezerRepository.deleteByNumber(number);
    }

    @Transactional
    public void updateFreezerDetails(String number, String room, String address, String type) {
        freezerRepository.updateFreezerDetailsByNumber(room, address, type, number);
    }

}
