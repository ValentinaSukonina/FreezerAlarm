package com.example.backend.service;

import com.example.backend.entity.Freezer;
import com.example.backend.exception.Exceptions;
import com.example.backend.repository.FreezerRepository;
import jakarta.transaction.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
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

    /*    public User updateUserByUsername(String oldUsername, User updatedUserDetails) {
        List<User> users = userRepository.findByUsername(oldUsername);
        if (users.isEmpty()) {
            throw new ResourceNotFoundException("User not found with username: " + oldUsername);
        }
        User user = users.get(0);

        if (!user.getUsername().equals(updatedUserDetails.getUsername())) {
            List<User> userWithNewUsername = userRepository.findByUsername(updatedUserDetails.getUsername());
            if (!userWithNewUsername.isEmpty()) {
                throw new IllegalArgumentException("Username " + updatedUserDetails.getUsername() + " is already taken");
            }
        }

        user.setUsername(updatedUserDetails.getUsername());
        user.setNameSurname(updatedUserDetails.getNameSurname());
        user.setEmail(updatedUserDetails.getEmail());
        user.setProfilePicture(updatedUserDetails.getProfilePicture());
        return userRepository.save(user);
    }
/*
    public Freezer updateFreezerDetailsByNumber(String room, String address, String type, String number) {
        Freezer existingFreezer = findByNumber(number);
        if (freezerRepository.findByNumber(number).isEmpty()) {
            throw new Exceptions.NotFoundException("Freezer with number " + number + " not found");
        } else {
            existingFreezer.setRoom(room);
            existingFreezer.setAddress(address);
            existingFreezer.setType(type);
            return freezerRepository.save(existingFreezer);
        }
    }*/










