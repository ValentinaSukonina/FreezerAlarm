package com.example.backend.service;

import com.example.backend.dto.FreezerDTO;
import com.example.backend.dto.FreezerWithUsersDTO;
import com.example.backend.entity.Freezer;
import com.example.backend.exception.Exceptions;
import com.example.backend.mapper.FreezerMapper;
import com.example.backend.repository.FreezerRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class FreezerService {

    private final FreezerRepository freezerRepository;
    private final FreezerMapper freezerMapper;


    public FreezerService(FreezerRepository freezerRepository, FreezerMapper freezerMapper) {
        this.freezerRepository = freezerRepository;
        this.freezerMapper = freezerMapper;
    }

    public Freezer createFreezer(Freezer freezer) {
        Optional<Freezer> existingFreezer = freezerRepository.findByNumber(freezer.getNumber());
        if (existingFreezer.isPresent()) {
            throw new Exceptions.FreezerAlreadyExistsException("Freezer with serial number "
                    + freezer.getNumber() + " already exists.");
        }
        return freezerRepository.save(freezer);
    }

    // Get Freezer WITHOUT users
    public FreezerDTO findByNumber(String number) {
        Freezer freezer = freezerRepository.findByNumber(number)
                .orElseThrow(() -> new Exceptions.NotFoundException(
                        "Freezer with number " + number + " not found"));

        return freezerMapper.toFreezerDTO(freezer);
    }

    // Get Freezer WITH users
    public FreezerWithUsersDTO findByNumberWithUsers(String number) {
        Freezer freezer = freezerRepository.findByNumberWithUsers(number);

        if (freezer == null) {
            throw new Exceptions.NotFoundException("Freezer with number " + number + " not found");
        }

        return freezerMapper.toFreezerWithUsersDTO(freezer);
    }

    public Freezer findById(Long id) {
        return freezerRepository.findById(id)
                .orElseThrow(() -> new Exceptions.NotFoundException("Freezer with ID " + id + " not found"));
    }

    public List<FreezerDTO> findAll() {
        return freezerRepository.findAll().stream()
                .map(freezerMapper::toFreezerDTO)
                .toList();
    }

    public List<FreezerWithUsersDTO> getAllFreezersWithUsers() {
        return freezerRepository.findAllWithUsers().stream()
                .map(freezerMapper::toFreezerWithUsersDTO)
                .toList();
    }

    public Freezer updateFreezerDetailsByNumber(String number, Freezer freezer) {
        int updatedRows = freezerRepository.updateFreezerDetailsByNumber(
                freezer.getFile(), freezer.getAddress(), freezer.getRoom(), freezer.getType(), number
        );
        if (updatedRows == 0) {
            throw new Exceptions.NotFoundException("Freezer with number " + number + " not found.");
        }
        // Fetch and return the updated freezer
        return freezerRepository.findByNumber(number)
                .orElseThrow(() -> new Exceptions.NotFoundException("Error retrieving updated freezer with number " + number));
    }

    public void deleteFreezerByNumber(String number) {
        int deletedRows = freezerRepository.deleteByNumber(number);
        if (deletedRows == 0) {
            throw new Exceptions.NotFoundException("Freezer with number " + number + " not found.");
        }
    }

}



