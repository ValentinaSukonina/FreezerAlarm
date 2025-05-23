package com.example.backend.service;

import com.example.backend.controller.UserController;
import com.example.backend.dto.FreezerDTO;
import com.example.backend.dto.FreezerWithUsersDTO;
import com.example.backend.entity.Freezer;
import com.example.backend.entity.User;
import com.example.backend.entity.FreezerUser;
import com.example.backend.exception.Exceptions;
import com.example.backend.mapper.FreezerMapper;
import com.example.backend.repository.FreezerRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.FreezerUserRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class FreezerService {

    private final FreezerRepository freezerRepository;
    private final FreezerUserRepository freezerUserRepository;
    private final UserRepository userRepository;
    private final FreezerMapper freezerMapper;
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    public FreezerService(FreezerRepository freezerRepository, FreezerUserRepository freezerUserRepository, UserRepository userRepository, FreezerMapper freezerMapper) {
        this.freezerRepository = freezerRepository;
        this.freezerUserRepository = freezerUserRepository;
        this.userRepository = userRepository;
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
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException(
                        "Freezer with number " + number + " not found"));

        return freezerMapper.toFreezerDTO(freezer);
    }

    // Get Freezer WITH users
    public FreezerWithUsersDTO findByNumberWithUsers(String number) {
        Freezer freezer = freezerRepository.findByNumberWithUsers(number);

        if (freezer == null) {
            throw new Exceptions.ResourceNotFoundException("Freezer with number " + number + " not found");
        }

        return freezerMapper.toFreezerWithUsersDTO(freezer);
    }

    public FreezerDTO findById(Long id) {
        logger.info("Fetching freezer with ID {}", id);
        Freezer freezer = freezerRepository.findById(id)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Freezer with ID " + id + " not found"));

        return freezerMapper.toFreezerDTO(freezer);
    }

    public List<FreezerWithUsersDTO> getAllFreezersWithUsers() {
        return freezerRepository.findAllWithUsers().stream()
                .map(freezerMapper::toFreezerWithUsersDTO)
                .toList();
    }

    public FreezerDTO updateFreezerDetailsByNumber(String number, Freezer freezer) {
        int updatedRows = freezerRepository.updateFreezerDetailsByNumber(
                freezer.getFile(), freezer.getAddress(), freezer.getRoom(), freezer.getType(), number
        );
        if (updatedRows == 0) {
            throw new Exceptions.ResourceNotFoundException("Freezer with number " + number + " not found.");
        }
        // Fetch and return the updated freezer
        return freezerMapper.toFreezerDTO(
                freezerRepository.findByNumber(number)
                        .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Error retrieving updated freezer with number " + number))
        );
    }

    public void deleteFreezerByNumber(String number) {
        int deletedRows = freezerRepository.deleteByNumber(number);
        if (deletedRows == 0) {
            throw new Exceptions.ResourceNotFoundException("Freezer with number " + number + " not found.");
        }
    }

    public FreezerWithUsersDTO createFreezerWithUsers(FreezerWithUsersDTO dto) {
        Freezer freezer = freezerMapper.fromFreezerWithUsersDTO(dto);

        try {
            freezer = freezerRepository.save(freezer);
        } catch (DataIntegrityViolationException e) {
            throw new Exceptions.FreezerAlreadyExistsException("Freezer with number " + freezer.getNumber() + " already exists.");
        }

        for (Long userId : dto.userIds()) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new Exceptions.ResourceNotFoundException("User not found: " + userId));

            FreezerUser link = new FreezerUser();
            link.setUser(user);
            link.setFreezer(freezer);
            freezerUserRepository.save(link);
        }

        Freezer saved = freezerRepository.findByNumberWithUsers(freezer.getNumber());
        return freezerMapper.toFreezerWithUsersDTO(saved);
    }

    public List<FreezerDTO> getFreezersByUserId(Long userId) {
        return freezerUserRepository.findFreezersByUserId(userId);
    }

    public FreezerWithUsersDTO updateFreezerAndUsers(Long freezerId, FreezerWithUsersDTO dto) {
        Freezer freezer = freezerRepository.findById(freezerId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Freezer not found with ID: " + freezerId));

        // Update basic fields using data from the DTO
        freezer.setNumber(dto.number());
        freezer.setRoom(dto.room());
        freezer.setAddress(dto.address());
        freezer.setType(dto.type());
        freezer.setFile(dto.file());

        freezerRepository.save(freezer);

        // Reassign users
        freezerUserRepository.deleteByFreezer(freezer);

        for (Long userId : dto.userIds()) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new Exceptions.ResourceNotFoundException("User not found with ID: " + userId));

            FreezerUser link = new FreezerUser();
            link.setUser(user);
            link.setFreezer(freezer);
            freezerUserRepository.save(link);
        }

        Freezer updatedFreezer = freezerRepository.findByNumberWithUsers(freezer.getNumber());
        return freezerMapper.toFreezerWithUsersDTO(updatedFreezer);
    }
}